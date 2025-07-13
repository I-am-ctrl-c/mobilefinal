import workoutTemplate from './workout.html?raw'
import Footer from '../../components/Footer'
import workoutImg from '../../assets/images/Workout.jpg'
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'WorkoutPage',
  components: { Footer },
  template: workoutTemplate,
  setup() {
    const workoutImgRef = ref(workoutImg)

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
      renderCalorieRings()
    })

    return {
      workoutImg: workoutImgRef,
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
    bg.setAttribute("stroke", "#444"); // 浅灰色背景
    bg.setAttribute("stroke-width", stroke);

    const fg = document.createElementNS(svgNS, "circle");
    fg.setAttribute("cx", cx);
    fg.setAttribute("cy", cy);
    fg.setAttribute("r", radius);
    fg.setAttribute("fill", "none");
    fg.setAttribute("stroke", "#9d4edd");
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
    text1.setAttribute("fill", "white");
    text1.textContent = `${current} kcal`;

    const text2 = document.createElementNS(svgNS, "text");
    text2.setAttribute("x", cx);
    text2.setAttribute("y", svgHeight -1);
    text2.setAttribute("text-anchor", "middle");
    text2.setAttribute("font-size", size * 0.09);
    text2.setAttribute("fill", "white");
    text2.textContent = `${current} / ${goal} kcal`;

    svg.appendChild(bg);
    svg.appendChild(fg);
    svg.appendChild(text1);
    svg.appendChild(text2);

    ring.innerHTML = '';
    ring.appendChild(svg);
  });
}
