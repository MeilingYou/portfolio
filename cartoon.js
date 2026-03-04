const canvas = document.getElementById("cartoonCanvas");
const ctx = canvas.getContext("2d");

// -------------------------
// 1) Background (sky)
// -------------------------
ctx.fillStyle = "#87CEEB"; // sky blue
ctx.fillRect(0, 0, canvas.width, canvas.height);

// -------------------------
// 2) Sun (background object)
// -------------------------
ctx.beginPath();
ctx.fillStyle = "#FFD700";
ctx.arc(700, 90, 45, 0, Math.PI * 2);
ctx.fill();

// -------------------------
// 3) Ground
// -------------------------
ctx.fillStyle = "#3CB371"; // green
ctx.fillRect(0, 350, canvas.width, 150);

// -------------------------
// 4) Caption text (must be on canvas)
// -------------------------
ctx.fillStyle = "#000";
ctx.font = "28px Arial";
ctx.fillText("Welcome to my cartoon house!", 20, 40);

// -------------------------
// 5) House (base)
// -------------------------
ctx.fillStyle = "#D2691E"; // brown-ish
ctx.fillRect(250, 210, 300, 200);

// Roof (triangle using moveTo/lineTo)
ctx.beginPath();
ctx.fillStyle = "#8B0000"; // dark red
ctx.moveTo(230, 210);
ctx.lineTo(400, 120);
ctx.lineTo(570, 210);
ctx.closePath();
ctx.fill();
ctx.stroke();

// -------------------------
// 6) Door
// -------------------------
ctx.fillStyle = "#654321";
ctx.fillRect(380, 290, 60, 120);

// doorknob
ctx.beginPath();
ctx.fillStyle = "#FFD700";
ctx.arc(430, 350, 6, 0, Math.PI * 2);
ctx.fill();

// -------------------------
// 7) Windows (2)
// -------------------------
function drawWindow(x, y) {
  ctx.fillStyle = "#ADD8E6";
  ctx.fillRect(x, y, 60, 60);

  ctx.strokeStyle = "#000";
  ctx.strokeRect(x, y, 60, 60);

  // window cross
  ctx.beginPath();
  ctx.moveTo(x + 30, y);
  ctx.lineTo(x + 30, y + 60);
  ctx.moveTo(x, y + 30);
  ctx.lineTo(x + 60, y + 30);
  ctx.stroke();
}

drawWindow(290, 260);
drawWindow(450, 260);

// -------------------------
// 8) For-loop + translate (repeat grass blades)
// -------------------------
function drawGrassBlade() {
  ctx.beginPath();
  ctx.strokeStyle = "#1F7A1F";
  ctx.lineWidth = 3;
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -18);
  ctx.stroke();
}

ctx.save();
ctx.translate(40, 480); // start position (bottom area)

for (let i = 0; i < 30; i++) {
  drawGrassBlade();
  ctx.translate(25, 0); // move right each time
}

ctx.restore();
