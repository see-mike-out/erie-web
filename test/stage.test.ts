import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StreamingStream } from '../src/compile/audio-graph-streaming-stream';

describe('StreamingStream Class', () => {
  let stream: StreamingStream;
  const mockData: = [
    { value: 1, time: Date.now() },
    { value: 2, time: Date.now() + 10 }
  ];

  beforeEach(() => {
    stream = new StreamingStream({ has_base_tone: true });
  });

  afterEach(() => {
    if (!stream.is_destroyed) {
      stream.destroy();
    }
  });

  it('initializes with default properties', () => {
    expect(stream.is_relative).toBe(false);
    expect(stream.is_continued).toBe(false);
    expect(stream.has_base_tone).toBe(true);+
    expect(stream.status).toBe('Stopped');
    expect(stream.is_destroyed).toBe(false);
    expect(stream.is_started).toBe(false);
    expect(stream.is_muted).toBe(false);
    expect(stream.history.length).toBe(0);
  });

  describe('start()', () => {
    it('starts stream with base tone and sets flags', () => {
      stream.start();
      expect(stream.is_started).toBe(true);
      expect(stream.status).toBe('Playing');
    });

    it('is idempotent (multiple calls do not break)', () => {
      stream.start();
      stream.start();
      expect(stream.is_started).toBe(true);
      expect(stream.status).toBe('Playing');
    });
  });

  describe('destroy()', () => {
    it('cleans up and prevents play()', () => {
      stream.start();
      stream.destroy();
      expect(stream.is_destroyed).toBe(true);
      expect(stream.status).toBe('Stopped');
      expect(() => stream.play(mockData)).toThrow();
    });

    it('can be safely called multiple times', () => {
      stream.start();
      stream.destroy();
      expect(() => stream.destroy()).not.toThrow();
    });

    it('preserves history after destruction', () => {
      stream.start();
      stream.play(mockData);
      const lenBefore = stream.history.length;
      stream.destroy();
      expect(stream.history.length).toBe(lenBefore);
    });
  });

  describe('play(data)', () => {
    it('stores played data in history', () => {
      stream.start();
      stream.play(mockData);
      expect(stream.status).toBe('Playing');
      expect(stream.history.length).toBe(1);
      expect(stream.history[0].data).toEqual(mockData);
    });

    it('maintains max 100 entries in rolling history', () => {
      stream.start();
      for (let i = 0; i < 150; i++) {
        stream.play([{ value: i, time: Date.now() }]);
      }
      expect(stream.history.length).toBeLessThanOrEqual(100);
    });

    it('throws if play is called after destroy', () => {
      stream.start();
      stream.destroy();
      expect(() => stream.play(mockData)).toThrow();
    });
  });

  describe('play_test()', () => {
    it('runs async and adds data to history', async () => {
      stream.start();
      await stream.play_test();
      expect(stream.status).toBe('Playing');
      expect(stream.history.length).toBeGreaterThan(0);
    });
  });

  describe('stop() and cancel()', () => {
    it('stop halts playback but retains base tone', async () => {
      stream.start();
      stream.play(mockData);
      await stream.stop();
      expect(stream.status).toBe('Stopped');
      expect(stream.history.length).toBeGreaterThan(0);
      expect(stream.is_started).toBe(true);
    });

    it('cancel stops async playback', async () => {
      stream.start();
      const playPromise = stream.play_test();
      await stream.cancel();
      await playPromise;
      expect(stream.status).toBe('Stopped');
    });
  });

  describe('muteBaseTone() and unmuteBaseTone()', () => {
    it('toggles mute correctly', () => {
      stream.start();
      expect(stream.is_muted).toBe(false);
      stream.muteBaseTone();
      expect(stream.is_muted).toBe(true);
      stream.unmuteBaseTone();
      expect(stream.is_muted).toBe(false);
    });

    it('handles multiple mute/unmute without errors', () => {
      stream.start();
      stream.muteBaseTone();
      stream.muteBaseTone();
      expect(stream.is_muted).toBe(true);
      stream.unmuteBaseTone();
      stream.unmuteBaseTone();
      expect(stream.is_muted).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('play before start() does not crash', () => {
      expect(() => stream.play(mockData)).not.toThrow();
      // Optional: assert queuing behavior
    });

    it('destroy before start() works', () => {
      stream.destroy();
      expect(stream.is_destroyed).toBe(true);
    });

    it('restarts lifecycle after destroy', () => {
      stream.start();
      stream.destroy();
      stream.start();
      expect(stream.is_destroyed).toBe(false);
      expect(stream.is_started).toBe(true);
    });

    it('preserves FIFO behavior with >100 entries', () => {
      stream.start();
      for (let i = 0; i < 120; i++) {
        stream.play([{ value: i, time: Date.now() }]);
      }
      expect(stream.history.length).toBeLessThanOrEqual(100);
      expect(stream.history[0].data[0].value).toBeGreaterThanOrEqual(20);
    });
  });
});
