# Erie: a declarative grammar for data sonification (for web)

## Introduction

Erie is a declarative grammar for data sonification, and this JavaScript library is built for web environments using Web Audio API and Web Speech API.

## How to Use

### Prerequisits

#### Libraries

- [D3](https://d3js.org/) v7.8.4
- [Arquero](https://uwdata.github.io/arquero/) v5.2.0
- [Moment](https://momentjs.com/) 2.29.4

#### 

### On browser (Vanilla JS)

```{html}
<script src="https://cdn.jsdelivr.net/npm/arquero@latest"></script>
<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment.min.js"></script>
<script src="{path}/erie-web.js"></script>
```

(Working on CDN)

### On Node

```{js}
import * as Erie from "erie-web";
// ex) Erie.compileAuidoGraph
```


### To use audio sample files for musical instruments

#### On Browser

```{html}
Erie.setSampleBaseUrl(...);
```

## Documentation

[Link](https://see-mike-out.github.io/erie-documentation)

## Making a contribution

Erie is an open-source project, and waiting for your feedback!

### Build

```
npm i
npm run build
```

### And

- Open for pull/merge requests!
- Leave an issue for suggestions or bugs!
- Get on the board (let's work together)!

## License

MIT

## Cite
Software
```
@misc{erie
  title = {Erie},
  author = {Kim, Hyeok},
  year = {2023},
  note = {\url{https://github.com/see-mike-out/erie-web}}
}
```

Paper (will be updated)
```
@inproceedings{kim:2024erie
  title = {Erie: a Declarative Grammar for Data Sonification},
  author = {Kim, Hyeok and Kim, Yea-Seul and Hullman, Jessica},
  year = {2024},
  booktitle = {To apper in ACM CHI 2024},
  note = {\url{https://doi.org/10.1145/3613904.3642442}}
}
```
