// src/pages/Workout/index.js

import workoutTemplate from './workout.html?raw'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'
import workoutImg from '../../assets/images/Workout.jpg'
import workoutImg2 from '../../assets/images/Workout2.jpg'
import './workout.css'
import FirebaseService from '../../services/firebaseService.js' // still used for write operations
import WorkoutMetrics from '../../services/workoutMetricsService.js'


import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import messages from '../../i18n/workoutMessage.js'

let calorieChart, weightChart;
function updateChartTheme() {
  const axisColor = getComputedStyle(document.documentElement)
                       .getPropertyValue('--contrast-2')
                       .trim();
  if (calorieChart) {
    calorieChart.options.scales.x.ticks.color = axisColor;
    calorieChart.options.scales.y.ticks.color = axisColor;
    calorieChart.update();
  }
  if (weightChart) {
    weightChart.options.scales.x.ticks.color = axisColor;
    weightChart.options.scales.y.ticks.color = axisColor;
    weightChart.update();
  }
}



// 紧跟 updateChartTheme() 后面加：
function scrollToCharts() {
  const el     = document.getElementById('weeklyCharts');
  const nav    = document.getElementById('mainNav');
  const navH   = nav ? nav.getBoundingClientRect().height : 0;
  const margin = 16; // 导航栏下额外留白，按需微调

  const targetY = window.pageYOffset
                + el.getBoundingClientRect().top
                - navH
                - margin;

  window.scrollTo({ top: targetY, behavior: 'smooth' });
}


export default {
  name: 'WorkoutPage',
  components: { NavBar, Footer },
  template: workoutTemplate,
  setup() {

    const language = ref(window.currentLang || 'en')
    const t = key => messages[language.value]?.[key] || key
 // ① 新增：更新图表标签的函数
     function updateChartLabels() {
        const newLabels = [
          t('mon'), t('tue'), t('wed'),
          t('thu'), t('fri'), t('sat'), t('sun')
        ]
        if (calorieChart) {
          calorieChart.data.labels = newLabels
          calorieChart.update()
        }
        if (weightChart) {
          weightChart.data.labels = newLabels
          weightChart.update()
        }
      }
  
      // ② 修改：语言切换时也更新图表标签
      function handleLangChange() {
        language.value = window.currentLang
        updateChartLabels()
        if (window.triggerBMIUpdate) {
          window.triggerBMIUpdate();   // refresh that “Your BMI” text + category under it
        }
      }  

    // 图片引用
    const workoutImgRef  = ref(workoutImg)
    const workoutImg2Ref = ref(workoutImg2)

    // ── Firebase backend ──
    const metrics  = WorkoutMetrics.getInstance()       // high-level cached reads
    const uid = window.currentUserId || 'demoUser'

    // 当前选中日期卡路里环 & 本周累计大环
    const selectedCalories = ref({ current: 0, goal: 2000 })
    const weeklyTotals     = ref({ current: 0, goal: 0 })


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

    // —— 月份切换 ——
const prevMonth = () => {
  const y = currentMonth.value.getFullYear()
  const m = currentMonth.value.getMonth()
  currentMonth.value = new Date(y, m - 1, 1)
}
const nextMonth = () => {
  // 如果已经是本月，就别往后跳了
  const now = new Date()
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  if (
    currentMonth.value.getFullYear() === firstOfThisMonth.getFullYear() &&
    currentMonth.value.getMonth()    === firstOfThisMonth.getMonth()
  ) {
    return
  }
  // 否则正常跳到下一个月
  const y = currentMonth.value.getFullYear()
  const m = currentMonth.value.getMonth()
  currentMonth.value = new Date(y, m + 1, 1)
}


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

    const showCalorieEditor = ref(false)
const calorieEditorCurrent = ref(0)
const calorieEditorGoal = ref(0)

const openCalorieEditor = () => {
  calorieEditorCurrent.value = selectedCalories.value.current
  calorieEditorGoal.value = selectedCalories.value.goal
  showCalorieEditor.value = true
}
const saveCalorieEdit = async () => {
  const uid = window.currentUserId || 'demoUser'
  const dateStr = selectedDate.value
  const dateObj = new Date(dateStr)
  const current = parseInt(calorieEditorCurrent.value)
  const goal = parseInt(calorieEditorGoal.value)

    // 1. 更新当前选中圈的数据
    selectedCalories.value = { current, goal }
    showCalorieEditor.value = false

    // 2. 持久化到 Firebase
    await FirebaseService.getInstance().updateCalories(uid, dateObj, current, goal)

    // 3. 同步更新月度日历的数据源 dailyStats
    //    这样模板里 :data-current/:data-goal 会自动变更
    dailyStats.value[dateStr] = {
      caloriesCurrent: current,
      caloriesGoal:    goal
    }

    // 4. 重新渲染所有圆环
    await nextTick(renderCalorieRings)
}
const topActivities = ref([])

    /* ─────────────────────────── Firebase 数据加载 ─────────────────────────── */

    function dateId(d) {
      // Convert to local YYYY-MM-DD, compensating timezone offset
      const tzOffsetMs = d.getTimezoneOffset() * 60000
      return new Date(d.getTime() - tzOffsetMs).toISOString().split('T')[0]
    }

    async function loadSelectedDateStats() {
      const daily = await metrics.getDaily(uid, new Date(selectedDate.value))
      selectedCalories.value = {
        current: daily.caloriesCurrent,
        goal:    daily.caloriesGoal
      }

      // ── NEW: Prefill BMI inputs & activities list ──
      const heightInputEl  = document.getElementById('heightInput')
      const weightInputEl  = document.getElementById('weightInput')
      if (heightInputEl && weightInputEl && daily.bmi) {
        heightInputEl.value = daily.bmi.height ?? ''
        weightInputEl.value = daily.bmi.weight ?? ''
      }

      // Trigger BMI UI refresh (function exported from setupBMICalculator)
      if (typeof window.triggerBMIUpdate === 'function') {
        window.triggerBMIUpdate()
      } else {
        // fallback – dispatch input events to invoke listener inside setupBMICalculator
        heightInputEl && heightInputEl.dispatchEvent(new Event('input'))
        weightInputEl && weightInputEl.dispatchEvent(new Event('input'))
      }

      // Activities
      const listEl = document.getElementById('activityList')
      if (listEl) {
        listEl.innerHTML = ''
        ;(daily.activities ?? []).forEach(act => {
          const card = document.createElement('div')
          card.className = 'activity-card'
          card.innerHTML = `
            <div class="flex items-center">
              <span class="icon">${act.icon || '🏃'}</span>
              <span>${act.name}</span>
            </div>
            <span>${act.duration} min</span>
          `
          listEl.appendChild(card)
        })
      }

      await nextTick(renderCalorieRings)
    }

    async function loadWeekStats() {
      const range = weeks[currentIndex.value]
      if (!range) return

      const weekArr = await metrics.getWeekArray(uid, range.start)

      const labels = [
        t('sun'), t('mon'), t('tue'), t('wed'), t('thu'),
        t('fri'), t('sat')
      ]
      const dataCal = weekArr.map(d => d.caloriesCurrent ?? 0)
      const dataWgt = weekArr.map(d => d.bmi?.weight ?? null)

      // 周累计
      const totals = weekArr.reduce((acc,d)=>{
        acc.current += d.caloriesCurrent || 0
        acc.goal    += d.caloriesGoal    || 0
        return acc
      }, {current:0, goal:0})
      weeklyTotals.value = totals
           // —— 新增：汇总本周所有活动并取前两位 ——
           const activityMap = {}
           weekArr.forEach(d => {
             (d.activities || []).forEach(a => {
               activityMap[a.name] = (activityMap[a.name] || 0) + (a.duration || 0)
             })
           })
           const sorted = Object.entries(activityMap)
             .map(([name, duration]) => ({ name, duration }))
             .sort((a, b) => b.duration - a.duration)
           topActivities.value = sorted.slice(0, 2)

      await nextTick(renderCalorieRings)

      if (calorieChart) {
        calorieChart.data.labels = labels
        calorieChart.data.datasets[0].data = dataCal
        calorieChart.update()
      }
      if (weightChart) {
        weightChart.data.labels = labels
        weightChart.data.datasets[0].data = dataWgt
        weightChart.update()
      }
    }

    async function loadMonthStats() {
      const map = await metrics.getMonthMap(uid, currentMonth.value)

      // 1. 构建 dailyStats 给模板用
      dailyStats.value = Object.entries(map).reduce((acc, [iso, s]) => {
        acc[iso] = {
          caloriesCurrent: s.caloriesCurrent ?? 0,
          caloriesGoal:    s.caloriesGoal    ?? 100
        }
        return acc
      }, {})

      // 2. （可选）同步更新 calendar.value，让深度 watch 能检测到变化
      calendar.value.forEach(week =>
        week.forEach(day => {
          const stat = dailyStats.value[dateId(day.date)] || {}
          day.current = stat.caloriesCurrent
          day.goal    = stat.caloriesGoal
        })
      )
    }

    


    // 监听选择变更
    watch(selectedDate, loadSelectedDateStats)
    watch(currentIndex, loadWeekStats)

    

    // —— Monthly Calendar ——
    // Default to the current calendar month
    const today = new Date()
    const currentMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))
    const monthDisplay = computed(() =>
      currentMonth.value.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    )
    const generateCalendar = () => {
      const year     = currentMonth.value.getFullYear()
      const monthIdx = currentMonth.value.getMonth()

      const firstOfMonth = new Date(year, monthIdx, 1)
      // Calendar starts on Monday; compute offset from Monday (0)
      const offset = (firstOfMonth.getDay() + 6) % 7
      const start  = new Date(firstOfMonth)
      start.setDate(start.getDate() - offset)

      const cal = []
      let cursor = new Date(start)
      for (let w = 0; w < 6; w++) {
        const week = []
        for (let d = 0; d < 7; d++) {
          week.push({
            date: new Date(cursor),
            inMonth: cursor.getMonth() === monthIdx,
            current: 0,
            goal:    100 // default goal to ensure some visual ring
          })
          cursor.setDate(cursor.getDate() + 1)
        }
        cal.push(week)
      }
      return cal
    }
    // in setup()
const calendar = ref(generateCalendar())
const dailyStats = ref({})      // { "2025-07-17": { caloriesCurrent, caloriesGoal }, … }
const monthWeeks = computed(() => calendar.value)

// —— 月度日历：切换月份时 立即重拉数据 & 渲染 ——
watch(currentMonth, async () => {
  // 1. 重新生成格子
  calendar.value = generateCalendar()
  // 2. 按 ISO 日期拉取当月所有 stats
  const map = await metrics.getMonthMap(uid, currentMonth.value)
  // 3. 构建 dailyStats：{ "2025-07-19": { caloriesCurrent, caloriesGoal }, … }
  dailyStats.value = Object.entries(map).reduce((acc, [iso, s]) => {
    acc[iso] = {
      caloriesCurrent: s.caloriesCurrent || 0,
      caloriesGoal:    s.caloriesGoal    || 100
    }
    return acc
  }, {})
  // 4. 渲染所有日历上的圆环
  await nextTick(renderCalorieRings)
}, { immediate: true })



    // 深度监听 calendar 数据变动（如 loadMonthStats 更新 current/goal）
    watch(calendar, async () => {
      await nextTick()
      renderCalorieRings()
    }, { deep: true })

    // —— Chart.js 数据准备 ——


    onMounted(() => {
      // 渲染：SVG 环、BMI 计算器、活动弹窗
      renderCalorieRings()
      setupBMICalculator(t)
      setupActivityModal(t)
      document.getElementById('calorieRingContainer')?.addEventListener('click', openCalorieEditor)
      window.addEventListener('languagechange', handleLangChange)

      const styles     = getComputedStyle(document.documentElement);
      const axisColor  = styles.getPropertyValue('--font-10').trim();
      // 等 DOM 真正挂载后再绘制图表
      nextTick(() => {
        const labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
        const dataCal = new Array(7).fill(0)
        const dataWgt = new Array(7).fill(null)
      onUnmounted(() => {
          window.removeEventListener('languagechange', handleLangChange)
        })
        

        // 柱状图
        calorieChart = new Chart(
                document.getElementById('calorieBarChart').getContext('2d'),
                {
                  type: 'bar',
                  data: {
                    labels,
                    datasets: [{
                      data: dataCal,
                      backgroundColor: 'rgba(127,90,255,0.6)'
                    }]
                  },
                  options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        ticks: { color: axisColor },
                        grid:  { display:false }
                      },
                      y: {
                        beginAtZero: true,
                        ticks: {
                          color: axisColor,
                          callback: val => val + ' kcal'
                        },
                        grid: { display: false }
                      }
                      
                    },
                    plugins: { legend: { display: false } }
                  }
                }
              )

        // 折线图
        weightChart = new Chart(
                document.getElementById('weightLineChart').getContext('2d'),
                {
                  type: 'line',
                  data: {
                    labels,
                    datasets: [{
                      data: dataWgt,
                      borderColor: 'rgba(127,90,255,1)',
                      borderWidth: 2,
                      tension: 0.3,
                      pointRadius: 4
                    }]
                  },
                  options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        ticks: { color: axisColor },
                        grid:  { display:false }
                      },
                      y: {
                        beginAtZero: false,
                        ticks: {
                          color: axisColor,
                          callback: val => val + ' kg'
                        },
                        grid: { display: false }
                      }
                      
                    },
                    plugins: { legend: { display: false } }
                  }
                }
              )
              updateChartTheme();
              updateChartLabels()
            
            

              // ④ 监听 <html> 的 class 变化（dark/light 切换时触发）
              const observer = new MutationObserver(muts => {
                muts.forEach(m => {
                  if (m.attributeName === 'class') {
                    updateChartTheme();
                  }
                });
              });
              observer.observe(document.documentElement, { attributes: true });
         

        // 初始加载
        loadSelectedDateStats()
        loadWeekStats()
        loadMonthStats()
      })
    })
    // ① 在 mounted 时注册切换监听

        // ② 卸载时移除监听
        onUnmounted(() => {
          window.removeEventListener('languagechange', handleLangChange)
        })

    return {
      workoutImg: workoutImgRef,
      workoutImg2: workoutImg2Ref,
      weekDisplay, prevWeek, nextWeek,
      selectedDate, minDate, maxDate, showDatePicker, selectedDateDisplay,
      monthDisplay, calendar,  monthWeeks,
      dailyStats,
      selectedCalories, weeklyTotals,showCalorieEditor,
      calorieEditorCurrent,
      calorieEditorGoal,
      saveCalorieEdit,
      prevMonth,
      nextMonth,
      topActivities,scrollToCharts,t,language,

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



function setupBMICalculator(t) {
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
        // 更新文字与颜色，用 t(...) 拿翻译
        r.textContent = `${t('yourBMI')}: ${bmi.toFixed(1)}`;

    lbl.textContent = t(cat.key);
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

    // ── NEW: Persist BMI to Firebase ──
    if (height && weight) {
      const bmiVal = parseFloat(bmi.toFixed(1))
      const uid = window.currentUserId || 'demoUser'
      const dateStr = document.querySelector('input[type="date"]')?.value
      const dateObj = dateStr ? new Date(dateStr) : new Date()
      FirebaseService.getInstance()
        .updateBMIDoubleAndPropagate(uid, dateObj, height, weight, bmiVal)
        .catch(console.error)
    }
  }

    function getCat(bmi) {
        if (bmi < 18.5) return { key: 'underweight', color: '#7dd3fc' };
        if (bmi < 25)   return { key: 'normal',      color: '#86efac' };
        if (bmi < 30)   return { key: 'overweight',  color: '#fde68a' };
                       return { key: 'obesity',     color: '#f87171' };
      }

  h.addEventListener('input', update);
  w.addEventListener('input', update);  // 加上体重监听
  update(); // 初始触发一次

  // Export for external trigger (e.g., when inputs programmatically set)
  window.triggerBMIUpdate = update;
}

// src/pages/Workout/index.js

function setupActivityModal(t) {

  // 用当前模式（add/edit）动态更新弹窗标题
  function updateModalTitle() {
    const key = editingCard ? 'editActivity' : 'addActivity';
    titleEl.textContent = t(key);
  }


  let selectedIcon = "🏃";
  let editingCard = null;

  const openBtn       = document.getElementById("addActivityBtn");
  const modal         = document.getElementById("activityModal");
  const cancelBtn     = document.getElementById("cancelActivity");
  const deleteBtn     = document.getElementById("deleteActivity"); 
  const saveBtn       = document.getElementById("saveActivity");
  const nameInput     = document.getElementById("activityName");
  const durationInput = document.getElementById("activityDuration");
  const iconOptions   = document.querySelectorAll(".icon-option");
  const list          = document.getElementById("activityList");
  const titleEl       = modal.querySelector("h2");  // 弹窗标题

  
  // —— 打开“添加”模式 ——
  openBtn.onclick = () => {
    editingCard = null;
    updateModalTitle();
    nameInput.value     = "";
    durationInput.value = "";
    selectedIcon        = "🏃";
    iconOptions.forEach(b => b.classList.remove("ring-2", "selected"));
    modal.classList.remove("hidden");
  };

  // —— 取消/关闭 ——
  cancelBtn.onclick = () => {
    modal.classList.add("hidden");
    editingCard = null;
  };

    // —— 点击 Delete —— 
  deleteBtn.onclick = async () => {
    if (!editingCard) return;
    // 从 DOM 中移除
    editingCard.remove();
    // 同步剩余活动到 Firestore
    const remaining = Array.from(list.querySelectorAll(".activity-card")).map(c => {
      const icon = c.querySelector(".icon").textContent;
      const spans = c.querySelectorAll("span");
      const name = spans[1].textContent.trim();
      const dur  = parseInt(spans[spans.length-1].textContent);
      return { name, duration: dur, icon };
    });
    try {
      const uid     = window.currentUserId || "demoUser";
      const dateStr = document.querySelector('input[type="date"]').value;
      await FirebaseService.getInstance()
        .updateActivities(uid, new Date(dateStr), remaining);
    } catch (err) {
      console.error("Failed to delete activity:", err);
    }
    // 关闭弹窗
    modal.classList.add("hidden");
    editingCard = null;
  };

  // —— 选择图标 ——（保持原有逻辑不变）
  iconOptions.forEach(btn => {
    btn.onclick = () => {
      selectedIcon = btn.dataset.icon;
      iconOptions.forEach(b => b.classList.remove("ring-2", "selected"));
      btn.classList.add("ring-2", "selected");
    };
  });

  // —— 点击已有条目进入“编辑”模式 ——
  list.addEventListener("click", e => {
    const card = e.target.closest(".activity-card");
    if (!card) return;

    editingCard = card;
    updateModalTitle();

    // 预填入弹窗表单
    const iconSpan = card.querySelector(".icon");
    selectedIcon = iconSpan.textContent;
    iconOptions.forEach(b => b.classList.remove("ring-2", "selected"));
    const hit = Array.from(iconOptions).find(b => b.dataset.icon === selectedIcon);
    if (hit) hit.classList.add("ring-2", "selected");

    const spans = card.querySelectorAll("span");
    nameInput.value     = spans[1].textContent.trim();
    durationInput.value = spans[spans.length-1].textContent.replace(/\D/g, "");
    modal.classList.remove("hidden");
    deleteBtn.classList.remove("hidden");   // 显示 Delete
  });

  // —— 保存：区分新增 vs 编辑 —— 
  saveBtn.onclick = async () => {
    const name     = nameInput.value.trim();
    const duration = durationInput.value.trim();
    if (!name || !duration) {
      alert("Please enter name and duration");
      return;
    }

    if (editingCard) {
      // 编辑已有卡片
      editingCard.querySelector(".icon").textContent = selectedIcon;
      editingCard.querySelectorAll("span")[1].textContent = name;
      const durSpan = editingCard.querySelectorAll("span")
                           [editingCard.querySelectorAll("span").length - 1];
      durSpan.textContent = `${duration} min`;
    } else {
      // 新增卡片
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
    }

    // —— 持久化所有活动到 Firebase ——
    const acts = Array.from(list.querySelectorAll(".activity-card")).map(c => {
      const icon   = c.querySelector(".icon").textContent;
      const spans  = c.querySelectorAll("span");
      const actName= spans[1].textContent.trim();
      const durTxt = spans[spans.length-1].textContent;
      return { name: actName, duration: parseInt(durTxt), icon };
    });
    try {
      const uid     = window.currentUserId || "demoUser";
      const dateStr = document.querySelector('input[type="date"]').value;
      const dateObj = dateStr ? new Date(dateStr) : new Date();
      await FirebaseService.getInstance()
        .updateActivities(uid, dateObj, acts);
    } catch (err) {
      console.error("Failed to update activities:", err);
    }

    // —— 重置并关闭 ——
    modal.classList.add("hidden");
    editingCard = null;
  };
  
}


