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
function renderCalorieRings() {
  document.querySelectorAll(".calorie-ring").forEach(ring => {
    const current = parseInt(ring.dataset.current) || 0;
    const goal = parseInt(ring.dataset.goal) || 1;
    const size = parseInt(getComputedStyle(ring).getPropertyValue('--ring-size')) || 180;
    const stroke = 20;
    const radius = (size - stroke) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * radius;
    const ratio = Math.min(current / goal, 1);
    const dashOffset = circumference * (1 - ratio);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.classList.add("ring-svg");

    const bg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    bg.setAttribute("cx", cx);
    bg.setAttribute("cy", cy);
    bg.setAttribute("r", radius);
    bg.setAttribute("fill", "none");
    bg.setAttribute("stroke", "#2e2e2e");
    bg.setAttribute("stroke-width", stroke);

    const fg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    fg.setAttribute("cx", cx);
    fg.setAttribute("cy", cy);
    fg.setAttribute("r", radius);
    fg.setAttribute("fill", "none");
    fg.setAttribute("stroke", "#9d4edd");
    fg.setAttribute("stroke-width", stroke);
    fg.setAttribute("stroke-linecap", "round");
    fg.setAttribute("stroke-dasharray", circumference);
    fg.setAttribute("stroke-dashoffset", dashOffset);

    svg.appendChild(bg);
    svg.appendChild(fg);
    ring.appendChild(svg);

    const text = document.createElement("div");
    text.className = "ring-text";
    text.innerHTML = `
      <div class="ring-value">${current}</div>
      <div class="ring-label">kcal</div>
    `;

    const subtext = document.createElement("div");
    subtext.className = "ring-subtext";
    subtext.textContent = `${current} / ${goal}`;

    ring.appendChild(text);
    ring.appendChild(subtext);
  });
}

