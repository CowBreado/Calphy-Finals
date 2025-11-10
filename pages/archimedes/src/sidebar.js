const scaleSlider = document.getElementById("scale-slider");
const scaleOutput = document.getElementById("scale-output");

const updateScale = () => {
  scaleOutput.value = `${scaleSlider.value}%`;
}

updateScale();
scaleSlider.addEventListener("input", updateScale);

const materials = [
  {
    name: "Pine Wood",
    density: 500,
    color: "#9a662a",
  },
  {
    name: "Ice",
    density: 917,
    color: "#bedbff",
  },
  {
    name: "Aluminum",
    density: 2700,
    color: "#90a1b9"
  },
  {
    name: "Steel",
    density: 7850,
    color: "#45556c",
  },
  {
    name: "Lead",
    density: 11340,
    color: "#1e2939"
  },
]

let materialList;
document.addEventListener("DOMContentLoaded", () => {
  materialList = document.getElementById("material-list");

  const createMaterial = (material, index) => {
    const materialDiv = document.createElement("div");
    materialDiv.classList = "list--item-material px-2 pt-1 border-primary rounded";
    materialDiv.dataset.id = index;

    materialDiv.innerHTML = `
      <p class="mb-1 text-white fs-5 fw-bold">${material.name}</p>
      <p class="text-white fs-6">${material.density} kg/m<sup>3</sup></p>
    `;

    materialList.appendChild(materialDiv);
  }

  materials.forEach((material, index) => createMaterial(material, index));
  materialList.addEventListener("click", event => {
    if (!event.target && !event.target.classList.contains("list--item-material")) {
      return;
    }

    const listItem = event.target.closest("div");
    if (!listItem) {
      return;
    }

    const id = listItem.dataset.id;
    const material = materials[id];

    const scale = document.getElementById("scale-slider").valueAsNumber;
    const size = scale * 2;

    const body = Bodies.rectangle(
      width / 2,
      200,
      size,
      size,
      {
        label: material.name,
        density: material.density / 1_000_000,
        render: { fillStyle: material.color },
      }
    );

    Composite.add(world, body);
  })
})

