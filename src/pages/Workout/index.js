// src/pages/Workout/index.js

import workoutTemplate from './workout.html?raw'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'
import workoutImg from '../../assets/images/Workout.jpg'
import workoutImg2 from '../../assets/images/Workout2.jpg'
import './workout.css'

import { ref, computed, onMounted, watch, nextTick } from 'vue'
import Chart from 'chart.js/auto'

export default {
  name: 'WorkoutPage',
  components: { NavBar, Footer },
  template: workoutTemplate,
  setup() {
    // 图片引用
    const workoutImgRef  = ref(workoutImg)
    const workoutImg2Ref = ref(workoutImg2)

    // —— 周列表 & 切换逻辑 —— 
    const generateWeekRanges = () => {
      const result = []
      let start = new Date('2020-01-01')
      const today = new Date()
      // 向前补到最近的周日
      while (start.getDay() !== 0) {
        start.setDate(start.getDate() - 1)
      }
      // 生成每周区间（周日到下周六）
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
      const r = weeks[currentIndex.value]
      const fmt = d => `${d.getMonth()+1}.${d.getDate()}`
      return `${fmt(r.start)} – ${fmt(r.end)}`
    })
    const prevWeek = () => { if (currentIndex.value > 0) currentIndex.value-- }
    const nextWeek = () => { if (currentIndex.value < weeks.length-1) currentIndex.value++ }

    // —— Date Picker —— 
    const formatDate = d => {
      const y  = d.getFullYear()
      const m  = String(d.getMonth()+1).padStart(2,'0')
      const dd = String(d.getDate()).padStart(2,'0')
      return `${y}-${m}-${dd}`
    }
    const todayDate       = new Date()
    const selectedDate    = ref(formatDate(todayDate))
    const minDate         = ref('2020-01-01')
    const maxDate         = ref(formatDate(todayDate))
    const showDatePicker  = ref(false)
    const selectedDateDisplay = computed(() => selectedDate.value)
    watch(selectedDate, nv => {
      const d = new Date(nv)
      const idx = weeks.findIndex(w => w.start <= d && d <= w.end)
      if (idx !== -1) currentIndex.value = idx
    })

    // —— Monthly Calendar —— 
    const currentMonth = ref(new Date(2025, 6, 1))
    const monthDisplay = computed(() =>
      currentMonth.value.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    )
    const generateCalendar = () => {
      const y = currentMonth.value.getFullYear()
      const m = currentMonth.value.getMonth()
      const first = new Date(y, m, 1)
      const offset = (first.getDay() + 6) % 7  // 周一=0
      const start = new Date(first)
      start.setDate(start.getDate() - offset)
      const cal = []
      let cursor = new Date(start)
      for (let w = 0; w < 6; w++) {
        const week = []
        for (let d = 0; d < 7; d++) {
          let cur = 0, goalVal = 2000
          // 演示：2025年7月随机几天有数据
          if (y === 2025 && m === 6) {
            const samples = [3,7,12,19,25]
            if (samples.includes(cursor.getDate())) {
              cur = Math.floor(Math.random()*801) + 200
            }
          }
          week.push({
            date: new Date(cursor),
            inMonth: cursor.getMonth() === m,
            current: cur,
            goal: goalVal
          })
          cursor.setDate(cursor.getDate() + 1)
        }
        cal.push(week)
      }
      return cal
    }
    const calendar = ref(generateCalendar())
    const prevMonth = () => {
      const d = new Date(currentMonth.value)
      d.setMonth(d.getMonth() - 1)
      if (d >= new Date(2020, 0, 1)) currentMonth.value = d
    }
    const nextMonth = () => {
      const d = new Date(currentMonth.value)
      d.setMonth(d.getMonth() + 1)
      if (d <= new Date()) currentMonth.value = d
    }
    watch(currentMonth, () => {
      calendar.value = generateCalendar()
      nextTick(renderCalorieRings)
    })

    // —— Chart.js 数据准备 —— 
    

    onMounted(() => {
      // 渲染：SVG 环、BMI 计算器、活动弹窗
      renderCalorieRings()
      setupBMICalculator()
      setupActivityModal()

      // 等 DOM 真正挂载后再绘制图表
      nextTick(() => {
        const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
        const dataCal = [350,420,310,480,500,390,450]
        const dataWgt = [70.2,70.0,69.8,69.9,69.7,69.5,69.6]

        // 柱状图
        new Chart(
          document.getElementById('calorieBarChart').getContext('2d'),
          { type:'bar',
            data:{ labels, datasets:[{ data:dataCal, backgroundColor:'rgba(127,90,255,0.6)' }] },
            options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ beginAtZero:true } }, plugins:{ legend:{ display:false } } }
          }
        )

        // 折线图
        new Chart(
          document.getElementById('weightLineChart').getContext('2d'),
          { type:'line',
            data:{ labels, datasets:[{ data:dataWgt, borderColor:'rgba(127,90,255,1)', borderWidth:2, tension:0.3, pointRadius:4 }] },
            options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ beginAtZero:false } }, plugins:{ legend:{ display:false } } }
          }
        )
      })
    })

    return {
      workoutImg: workoutImgRef,
      workoutImg2: workoutImg2Ref,
      weekDisplay, prevWeek, nextWeek,
      selectedDate, minDate, maxDate, showDatePicker, selectedDateDisplay,
      monthDisplay, calendar, prevMonth, nextMonth
    }
  }
}

// —— 公共方法，无需改动 —— 
function renderCalorieRings(defaultSize = 240, defaultFontRatio = 0.16) {
  document.querySelectorAll('.calorie-ring').forEach(ring => {
    const current   = parseInt(ring.dataset.current) || 0
    const goal      = parseInt(ring.dataset.goal)    || 1
    const size      = parseInt(ring.dataset.size)    || defaultSize
    const fontRatio = parseFloat(ring.dataset.font)  || defaultFontRatio

    const stroke   = Math.round(size * 0.083)
    const padding  = size * 0.24
    const radius   = (size - stroke) / 2
    const cx       = size / 2
    const cy       = size / 2 + padding / 2
    const circ     = 2 * Math.PI * radius
    const dashOff  = circ * (1 - Math.min(current / goal, 1))
    const svgH     = size + padding
    const NS       = 'http://www.w3.org/2000/svg'

    const svg = document.createElementNS(NS, 'svg')
    svg.setAttribute('width', size)
    svg.setAttribute('height', svgH)
    svg.classList.add('ring-svg')

    const bg = document.createElementNS(NS, 'circle')
    bg.setAttribute('cx', cx); bg.setAttribute('cy', cy); bg.setAttribute('r', radius)
    bg.setAttribute('fill', 'none'); bg.setAttribute('stroke', 'var(--font-7)')
    bg.setAttribute('stroke-width', stroke)

    const fg = document.createElementNS(NS, 'circle')
    fg.setAttribute('cx', cx); fg.setAttribute('cy', cy); fg.setAttribute('r', radius)
    fg.setAttribute('fill', 'none'); fg.setAttribute('stroke', 'var(--decorPu-5)')
    fg.setAttribute('stroke-width', stroke); fg.setAttribute('stroke-linecap', 'round')
    fg.setAttribute('stroke-dasharray', circ); fg.setAttribute('stroke-dashoffset', dashOff)
    fg.setAttribute('transform', `rotate(-90 ${cx} ${cy})`)

    const txt1 = document.createElementNS(NS, 'text')
    txt1.setAttribute('x', cx); txt1.setAttribute('y', cy)
    txt1.setAttribute('text-anchor', 'middle'); txt1.setAttribute('dominant-baseline', 'middle')
    txt1.setAttribute('font-size', size * fontRatio); txt1.setAttribute('font-weight', 'bold')
    txt1.setAttribute('fill', 'var(--font-10)')
    txt1.textContent = `${current} kcal`

    const txt2 = document.createElementNS(NS, 'text')
    txt2.setAttribute('x', cx); txt2.setAttribute('y', svgH - 1)
    txt2.setAttribute('text-anchor', 'middle'); txt2.setAttribute('font-size', size * 0.09)
    txt2.setAttribute('fill', 'var(--font-10)')
    txt2.textContent = `${current} / ${goal} kcal`

    svg.append(bg, fg, txt1, txt2)
    ring.innerHTML = ''; ring.appendChild(svg)
  })
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
    lbl.style.textShadow = `0 0 4px ${cat.color}`;

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

