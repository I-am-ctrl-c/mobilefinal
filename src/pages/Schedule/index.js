import './schedule.css';
import Footer from '../../components/Footer';
import NavBar from '../../components/NavBar';
import FirebaseService from '../../services/firebaseService';
import Booking from '../../models/Booking.js';
import scheduleTemplate from './schedule.html?raw';
import scheduleMessages from '../../i18n/schedule.js';
import { ref, computed, onMounted, onUnmounted } from 'vue';

export default {
  name: 'SchedulePage',
  components: { NavBar, Footer },
  template: scheduleTemplate,
  setup() {
    // Reactive state
    const bookings = ref([]);
    const equipmentMap = ref({});
    const currentPage = ref(1);
    const pageSize = ref(5);
    const unsubscribeBookings = ref(null);
    const userId = ref(null);
    const statusFilter = ref('all');
    const selectedPeriod = ref('month');
    const lang = ref('en');
    
    // Translation function with parameter support
    const t = (key, params = {}) => {
      let text = scheduleMessages[lang.value]?.[key] || key;
      Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
      });
      return text;
    };

    // Computed properties
    const timePeriods = computed(() => scheduleMessages[lang.value].timePeriods);
    
    const filteredBookings = computed(() => {
      if (statusFilter.value === 'all') return bookings.value;
      return bookings.value.filter(booking => booking.status === statusFilter.value);
    });

    const paginatedBookings = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return filteredBookings.value.slice(start, start + pageSize.value);
    });

    const totalPages = computed(() => Math.ceil(filteredBookings.value.length / pageSize.value));

    const periodBookings = computed(() => {
      const now = new Date();
      let startDate;

      switch (selectedPeriod.value) {
        case 'week': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
        case 'month': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
        case 'quarter': startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
        case 'year': startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); break;
        default: startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      return bookings.value.filter(booking => 
        booking.startTime >= startDate && booking.status !== 'cancelled'
      );
    });

    const topEquipment = computed(() => {
      const equipmentCount = {};
      periodBookings.value.forEach(booking => {
        const equipmentId = booking.equipmentId;
        if (equipmentId) equipmentCount[equipmentId] = (equipmentCount[equipmentId] || 0) + 1;
      });

      return Object.entries(equipmentCount)
        .map(([id, count]) => ({
          id,
          name: equipmentMap.value[id]?.name || t('unknownEquipment'),
          tags: equipmentMap.value[id]?.tags || [],
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    });

    const timePreferences = computed(() => {
      const timeSlots = {};
      for (let i = 6; i <= 22; i++) timeSlots[i] = 0;

      periodBookings.value.forEach(booking => {
        const hour = booking.startTime.getHours();
        if (hour >= 6 && hour <= 22) timeSlots[hour]++;
      });

      const maxCount = Math.max(...Object.values(timeSlots));
      return Object.entries(timeSlots)
        .filter(([, count]) => count > 0)
        .map(([hour, count]) => ({
          hour: parseInt(hour),
          label: `${hour}:00`,
          count,
          percentage: maxCount > 0 ? Math.round((count / maxCount) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    });

    const bodyPartFocus = computed(() => {
      const bodyParts = {
        'Upper Body': { count: 0, icon: '💪' },
        'Lower Body': { count: 0, icon: '🦵' },
        'Core': { count: 0, icon: '🏃' },
        'Cardio': { count: 0, icon: '❤️' },
        'Full Body': { count: 0, icon: '🏋️' }
      };

      periodBookings.value.forEach(booking => {
        const equipment = equipmentMap.value[booking.equipmentId];
        if (equipment?.tags) {
          const tags = equipment.tags.map(tag => tag.toLowerCase());
          if (tags.some(tag => ['chest','arms','shoulders','bench','press'].includes(tag))) {
            bodyParts['Upper Body'].count++;
          } else if (tags.some(tag => ['legs','squat','deadlift','glutes'].includes(tag))) {
            bodyParts['Lower Body'].count++;
          } else if (tags.some(tag => ['core','abs','back','plank'].includes(tag))) {
            bodyParts['Core'].count++;
          } else if (tags.some(tag => ['cardio','treadmill','bike','elliptical'].includes(tag))) {
            bodyParts['Cardio'].count++;
          } else {
            bodyParts['Full Body'].count++;
          }
        }
      });

      const total = Object.values(bodyParts).reduce((sum, part) => sum + part.count, 0);
      return Object.entries(bodyParts)
        .map(([key, data]) => {
          // 直接访问翻译文件中的 bodyParts 结构
          const translated = scheduleMessages[lang.value]?.bodyParts?.[key] || {};
          return {
            name: translated.name || key, // 显示翻译的名称，若无则回退到 key（如 "Upper Body"）
            icon: data.icon,
            description: translated.description || '', // 显示翻译的描述，若无则为空
            percentage: total > 0 ? Math.round((data.count / total) * 100) : 0
          };
        })
        .filter(part => part.percentage > 0)
        .sort((a, b) => b.percentage - a.percentage);
    });

    const weeklyActivity = computed(() => {
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayCounts = [0, 0, 0, 0, 0, 0, 0];

      periodBookings.value.forEach(booking => {
        dayCounts[booking.startTime.getDay()]++;
      });

      const maxCount = Math.max(...dayCounts);
      return weekDays.map((name, index) => ({
        name,
        count: dayCounts[index],
        height: maxCount > 0 ? Math.round((dayCounts[index] / maxCount) * 100) : 0
      }));
    });

    const summaryStats = computed(() => {
      const totalBookings = periodBookings.value.length;
      const activeSessions = periodBookings.value.filter(b => b.status === 'active').length;
      const totalDuration = periodBookings.value.reduce((sum, booking) => {
        return sum + (booking.endTime - booking.startTime);
      }, 0);
      const avgDurationMs = totalBookings > 0 ? totalDuration / totalBookings : 0;
      const avgDuration = Math.round(avgDurationMs / (1000 * 60));
      const activeDays = weeklyActivity.value.filter(day => day.count > 0).length;
      const consistencyScore = Math.round((activeDays / 7) * 100);

      return {
        totalBookings,
        activeSessions,
        avgDuration: `${avgDuration} ${t('minutes')}`,
        consistencyScore
      };
    });

    // Methods
    const loadBookings = async () => {
      const service = FirebaseService.getInstance();
      try {
        const allEquipment = await service.loadAllEquipment();
        const map = {};
        allEquipment.forEach(eq => map[eq.id] = eq);
        equipmentMap.value = map;
        unsubscribeBookings.value = service.streamBookingsByUser(userId.value, handleBookings);
      } catch (error) {
        console.error("Failed to load bookings:", error);
      }
    };

    const handleBookings = (newBookings) => {
      const now = new Date();
      const service = FirebaseService.getInstance();
      
      bookings.value = newBookings
        .map(booking => {
          try {
            const startTime = booking.startTime instanceof Date 
              ? booking.startTime 
              : booking.startTime.toDate();
            const endTime = booking.endTime instanceof Date 
              ? booking.endTime 
              : booking.endTime.toDate();
            
            if (booking.status === 'active' && endTime < now) {
              const updatedBooking = new Booking({
                ...booking,
                startTime,
                endTime,
                status: 'completed',
              });
              service.updateBooking(updatedBooking);
              return { ...booking, startTime, endTime, status: 'completed' };
            }
            return { ...booking, startTime, endTime };
          } catch (e) {
            console.error("Error processing booking:", booking, e);
            return null;
          }
        })
        .filter(booking => booking !== null)
        .sort((a, b) => a.startTime - b.startTime);
    };

    const toggleBookingStatus = async (booking) => {
      const service = FirebaseService.getInstance();
      const newStatus = booking.status === 'cancelled' ? 'active' : 'cancelled';

      try {
        const updatedBooking = new Booking({
          id: booking.id,
          userId: booking.userId,
          equipmentId: booking.equipmentId,
          startTime: booking.startTime,
          endTime: booking.endTime,
          remind: booking.remind,
          status: newStatus,
          createdAt: booking.createdAt
        });
        await service.updateBooking(updatedBooking);
      } catch (error) {
        console.error('Error updating booking status:', error);
      }
    };

    const nextPage = () => currentPage.value < totalPages.value && currentPage.value++;
    const prevPage = () => currentPage.value > 1 && currentPage.value--;
    const setStatusFilter = (status) => {
      statusFilter.value = status;
      currentPage.value = 1;
    };
    const setTimePeriod = (period) => selectedPeriod.value = period;

    const formatDate = (date) => {
      const dateObj = date instanceof Date ? date : date.toDate();
      return dateObj.toLocaleString(lang.value === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getEquipmentName = (id) => equipmentMap.value[id]?.name || t('unknownEquipment');
    const getEquipmentTags = (id) => equipmentMap.value[id]?.tags?.join(', ') || '';
    const getEquipmentImage = (id) => equipmentMap.value[id]?.imageUrl || '/src/assets/placeholder.png';

    // Lifecycle hooks
    onMounted(async () => {
      lang.value = window.currentLang || 'en';
      window.addEventListener('languagechange', () => {
        lang.value = window.currentLang || 'en';
      });

      const id = localStorage.getItem('userId');
      if (!id) {
        window.location.href = '/login';
        return;
      }
      userId.value = id;
      await loadBookings();
    });

    onUnmounted(() => {
      unsubscribeBookings.value?.();
      window.removeEventListener('languagechange', () => {});
    });

    return {
      // State
      bookings,
      currentPage,
      statusFilter,
      selectedPeriod,
      
      // Computed
      timePeriods,
      filteredBookings,
      paginatedBookings,
      totalPages,
      periodBookings,
      topEquipment,
      timePreferences,
      bodyPartFocus,
      weeklyActivity,
      summaryStats,
      
      // Methods
      toggleBookingStatus,
      nextPage,
      prevPage,
      setStatusFilter,
      setTimePeriod,
      formatDate,
      getEquipmentName,
      getEquipmentTags,
      getEquipmentImage,
      
      // Translation
      t
    };
  }
};