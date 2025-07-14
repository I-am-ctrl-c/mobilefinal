import workoutTemplate from './workout.html?raw'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'
import workoutImg from '../../assets/images/Workout.jpg'
import workoutImg2 from '../../assets/images/Workout2.jpg'
import './workout.css'

import { ref, computed, onMounted } from 'vue'

export default {
  name: 'WorkoutPage',
  components: { NavBar, Footer },
  template: workoutTemplate,
  setup() {
    const workoutImgRef = ref(workoutImg)
    const workoutImg2Ref = ref(workoutImg2)

    // 生成从 2020-01-01 到今天的周起始列表（每周日）
    const generateWeekRanges = () => {
      const result = []
      let start = new Date('2020-01-01')
      const today = new Date()

      while (start.getDay() !== 0) {
        start.setDate(start.getDate() - 1)
      }

      while (start <= today) {
        const end = new Date(start)
        end.setDate(end.getDate() + 6)
        result.push({ start: new Date(start), end })
        start.setDate(start.getDate() + 7)
      }

      return result
    }

    const weeks = generateWeekRanges()
    const currentIndex = ref(weeks.length - 1)

    const weekDisplay = computed(() => {
      const range = weeks[currentIndex.value]
      const fmt = (d) => `${d.getMonth() + 1}.${d.getDate()}`
      return `${fmt(range.start)} – ${fmt(range.end)}`
    })

    const prevWeek = () => {
      if (currentIndex.value > 0) currentIndex.value--
    }

    const nextWeek = () => {
      if (currentIndex.value < weeks.length - 1) currentIndex.value++
    }

    onMounted(() => {
      renderCalorieRings();
      setupBMICalculator();
      setupActivityModal(); 
    });
    

    return {
      workoutImg: workoutImgRef,
      workoutImg2: workoutImg2Ref,
      weekDisplay,
      prevWeek,
      nextWeek
    }
  }
}

// ✅ 移出 setup，放外部命名函数，避免 setup 作用域污染
// ✅ setup 外定义，无需 DOMContentLoaded
function renderCalorieRings(defaultSize = 240, defaultFontRatio = 0.16) {
  document.querySelectorAll(".calorie-ring").forEach(ring => {
    const current = parseInt(ring.dataset.current) || 0;
    const goal = parseInt(ring.dataset.goal) || 1;
    const size = parseInt(ring.dataset.size) || defaultSize;
    const fontRatio = parseFloat(ring.dataset.font) || defaultFontRatio;

    const stroke = Math.round(size * 0.083);             // 环宽度
    const padding = size * 0.24;                         // 上下预留空间
    const radius = (size - stroke) / 2;
    const cx = size / 2;
    const cy = size / 2 + padding / 2;                   // 圆心向下偏移一点，避免头部被裁
    const circumference = 2 * Math.PI * radius;
    const ratio = Math.min(current / goal, 1);
    const dashOffset = circumference * (1 - ratio);

    const svgHeight = size + padding;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", svgHeight);
    svg.classList.add("ring-svg");

    const bg = document.createElementNS(svgNS, "circle");
    bg.setAttribute("cx", cx);
    bg.setAttribute("cy", cy);
    bg.setAttribute("r", radius);
    bg.setAttribute("fill", "none");
    bg.setAttribute("stroke", "var(--font-7)"); // 浅灰色背景
    bg.setAttribute("stroke-width", stroke);

    const fg = document.createElementNS(svgNS, "circle");
    fg.setAttribute("cx", cx);
    fg.setAttribute("cy", cy);
    fg.setAttribute("r", radius);
    fg.setAttribute("fill", "none");
    fg.setAttribute("stroke", "var(--decorPu-5)");
    fg.setAttribute("stroke-width", stroke);
    fg.setAttribute("stroke-linecap", "round");
    fg.setAttribute("stroke-dasharray", circumference);
    fg.setAttribute("stroke-dashoffset", dashOffset);
    fg.setAttribute("transform", `rotate(-90 ${cx} ${cy})`);

    const text1 = document.createElementNS(svgNS, "text");
    text1.setAttribute("x", cx);
    text1.setAttribute("y", cy);
    text1.setAttribute("text-anchor", "middle");
    text1.setAttribute("dominant-baseline", "middle");
    text1.setAttribute("font-size", size * fontRatio);
    text1.setAttribute("font-weight", "bold");
    text1.setAttribute("fill", "var(--font-10)");
    text1.textContent = `${current} kcal`;

    const text2 = document.createElementNS(svgNS, "text");
    text2.setAttribute("x", cx);
    text2.setAttribute("y", svgHeight -1);
    text2.setAttribute("text-anchor", "middle");
    text2.setAttribute("font-size", size * 0.09);
    text2.setAttribute("fill", "var(--font-10)");
    text2.textContent = `${current} / ${goal} kcal`;

    svg.appendChild(bg);
    svg.appendChild(fg);
    svg.appendChild(text1);
    svg.appendChild(text2);

    ring.innerHTML = '';
    ring.appendChild(svg);
  });
}

function setupBMICalculator() {
  const h = document.getElementById('heightInput');
  const w = document.getElementById('weightInput');
  const r = document.getElementById('bmiResult');
  const lbl = document.getElementById('bmiLabel');
  const ptr = document.getElementById('bmiPointer');

  function update() {
    const height = parseFloat(h.value);
    const weight = parseFloat(w.value);
    if (!height || !weight || height < 50 || weight < 20) {
      r.textContent = 'Your BMI: --';
      lbl.textContent = '--';
      ptr.style.left = '0%';
      return;
    }

    const bmi = weight / ((height / 100) ** 2);
    const cat = getCat(bmi);

    // 更新文字与颜色
    r.textContent = `Your BMI: ${bmi.toFixed(1)}`;
    lbl.textContent = cat.label;
    lbl.style.color = cat.color;

    // 四等分区块内线性定位
    let left;
    if (bmi < 18.5) {
      const t = Math.min(Math.max((bmi - 0) / 18.5, 0), 1);
      left = t * 25;
    } else if (bmi < 25) {
      const t = (bmi - 18.5) / (25 - 18.5);
      left = 25 + t * 25;
    } else if (bmi < 30) {
      const t = (bmi - 25) / (30 - 25);
      left = 50 + t * 25;
    } else {
      const t = Math.min((bmi - 30) / 10, 1);
      left = 75 + t * 25;
    }
    ptr.style.left = `${left}%`;
  }

  function getCat(bmi) {
    if (bmi < 18.5) return { label: 'Underweight', color: '#7dd3fc' };
    if (bmi < 25)   return { label: 'Normal',      color: '#86efac' };
    if (bmi < 30)   return { label: 'Overweight',  color: '#fde68a' };
    return              { label: 'Obesity',     color: '#f87171' };
  }

  h.addEventListener('input', update);
  w.addEventListener('input', update);  // 加上体重监听
  update(); // 初始触发一次
}

function setupActivityModal() {
  let selectedIcon = "🏃";

  const openBtn = document.getElementById("addActivityBtn");
  const modal = document.getElementById("activityModal");
  const cancelBtn = document.getElementById("cancelActivity");
  const saveBtn = document.getElementById("saveActivity");

  const nameInput = document.getElementById("activityName");
  const durationInput = document.getElementById("activityDuration");
  const iconOptions = document.querySelectorAll(".icon-option");
  const list = document.getElementById("activityList");

  openBtn.onclick = () => modal.classList.remove("hidden");
  cancelBtn.onclick = () => modal.classList.add("hidden");

  iconOptions.forEach(btn => {
    btn.addEventListener("click", () => {
      selectedIcon = btn.dataset.icon;
      iconOptions.forEach(b => b.classList.remove("ring-2", "selected"));
      btn.classList.add("ring-2", "selected");
    });
  });

  saveBtn.onclick = () => {
    const name = nameInput.value.trim();
    const duration = durationInput.value.trim();

    if (!name || !duration) {
      alert("Please enter name and duration");
      return;
    }

    const card = document.createElement("div");
    card.className = "activity-card";
    card.innerHTML = `
      <div class="flex items-center">
        <span class="icon">${selectedIcon}</span>
        <span>${name}</span>
      </div>
      <span>${duration} min</span>
    `;
    list.appendChild(card);

    // 清空 + 关闭弹窗
    nameInput.value = "";
    durationInput.value = "";
    modal.classList.add("hidden");
  };
}

