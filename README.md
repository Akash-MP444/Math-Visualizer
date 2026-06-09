# 🌌 Math - Visualizer

> Interactive mathematical visualization platform for exploring equations in 2D, 3D, fractal space, and dynamical systems.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)
![Build](https://img.shields.io/badge/Build-Passing-success)
![Tests](https://img.shields.io/badge/Tests-28%20Passing-brightgreen)


## ✨ Features

* 2D Equation Plotting
* 3D Implicit & Explicit Surface Visualization
* Marching Cubes Isosurface Extraction
* Parametric Surfaces
* Mandelbrot, Julia & Burning Ship Fractals
* Lorenz, Rössler, Duffing & Van der Pol Attractors
* Vector Field Visualization
* Mathematical Analysis Tools
* PNG / STL / OBJ / GLTF Export
* Equation History & Favorites
* Keyboard Shortcuts & Mobile Support

---

## 📸 Screenshots

<h3>3D Surface</h3>
<img width="800" alt="3D Surface" src="https://github.com/user-attachments/assets/470699bb-56bc-464f-a144-c324d7f93091">

<h3>Fractal Explorer</h3>
<img width="500" alt="Mandelbrot" src="https://github.com/user-attachments/assets/d5c2c8d4-c20d-4852-b394-76421c40df80">

<h3>Strange Attractor</h3>
<img width="500" alt="Lorenz" src="https://github.com/user-attachments/assets/86b9e76e-55ae-45a7-9d3e-d2df42c9b930">

<h3>2D Curves</h3>
<img width="500" alt="Astroid" src="https://github.com/user-attachments/assets/56b4128f-f1e2-4b64-bb04-ee3d86846abb">


## ⚡ Quick Start

```bash
git clone https://github.com/Akash-MP444/Math-Visualizer.git

cd Math-Visualizer

npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🛠 Tech Stack

* Next.js 14
* TypeScript
* MathJS
* Zustand
* Web Workers
* Vitest

---

## 📂 Project Structure

```text
src/
├── app/
├── components/
├── engine/
│   ├── parser/
│   ├── geometry/
│   ├── fractals/
│   ├── attractors/
│   └── render/
├── hooks/
├── store/
├── utils/
├── workers/
└── __tests__/
```

---

## 🧪 Verification

```bash
npm run build
npm run test
```

* Production build successful
* TypeScript strict mode
* Tests passing

---

## 🎯 Example Equations

### 2D

```text
x^2 + y^2 = 1
x^(2/3) + y^(2/3) = 1
(x^2 + y^2 - 1)^3 = x^2*y^3
(x^2 + y^2)^2 = x^2 - y^2
x^3 + y^3 = 3*x*y
sin(x*y) = cos(x+y)
x^x = y^y
```

### 3D

```text
x^2 + y^2 + z^2 = 1
z = sin(x)*cos(y)
z = sin(sqrt(x^2+y^2))
z = x^2 - y^2
(sqrt(x^2+y^2)-2)^2 + z^2 = 1
sin(x)*cos(y)+sin(y)*cos(z)+sin(z)*cos(x)=0
cos(x)+cos(y)+cos(z)=0
x^4 + y^4 + z^4 = 1
```

### Parametric

```text
helix
torus_param
mobius
trefoil
klein
```

### Fractals

```text
mandelbrot
julia
burningship
```

### Attractors

```text
lorenz
rossler
duffing
vanderpol
```

### Vector Fields

```text
vf_rotation
vf_sink
vf_saddle
vf_dipole
```

---

## 👨‍💻 Author

**Akash MP**

Built using mathematics, computational geometry, and web technologies.

