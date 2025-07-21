import './schedule.css';
import Footer from '../../components/Footer';
import NavBar from '../../components/NavBar';
import FirebaseService from '../../services/firebaseService';
import Booking from '../../models/Booking.js';
import scheduleTemplate from './schedule.html?raw';

export default {
  name: 'SchedulePage',
  components: { NavBar, Footer },
  data() {
    return {
      bookings: [],
      equipmentMap: {},
      currentPage: 1,
      pageSize: 5,
      unsubscribeBookings: null,
      userId: null,
      statusFilter: 'all', // 新增：状态筛选
      selectedPeriod: 'month', // 新增：选中的时间周期
      timePeriods: [
        { value: 'week', label: 'Last Week' },
        { value: 'month', label: 'Last Month' },
        { value: 'quarter', label: 'Last 3 Months' },
        { value: 'year', label: 'Last Year' }
      ]
    };
  },
  computed: {
    // 新增：根据状态筛选的bookings
    filteredBookings() {
      if (this.statusFilter === 'all') {
        return this.bookings;
      }
      return this.bookings.filter(booking => booking.status === this.statusFilter);
    },
    paginatedBookings() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredBookings.slice(start, start + this.pageSize);
    },
    totalPages() {
      return Math.ceil(this.filteredBookings.length / this.pageSize);
    },

    // 新增：根据时间周期筛选的bookings
    periodBookings() {
      const now = new Date();
      let startDate;

      switch (this.selectedPeriod) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      return this.bookings.filter(booking =>
        booking.startTime >= startDate && booking.status !== 'cancelled'
      );
    },

    // 新增：最常预约的设备
    topEquipment() {
      const equipmentCount = {};

      this.periodBookings.forEach(booking => {
        const equipmentId = booking.equipmentId;
        if (equipmentId) {
          equipmentCount[equipmentId] = (equipmentCount[equipmentId] || 0) + 1;
        }
      });

      return Object.entries(equipmentCount)
        .map(([id, count]) => ({
          id,
          name: this.equipmentMap[id]?.name || 'Unknown Equipment',
          tags: this.equipmentMap[id]?.tags || [],
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    },

    // 新增：时间偏好
    timePreferences() {
      const timeSlots = {};

      // 初始化时间槽
      for (let i = 6; i <= 22; i++) {
        timeSlots[i] = 0;
      }

      this.periodBookings.forEach(booking => {
        const hour = booking.startTime.getHours();
        if (hour >= 6 && hour <= 22) {
          timeSlots[hour] = (timeSlots[hour] || 0) + 1;
        }
      });

      const maxCount = Math.max(...Object.values(timeSlots));

      return Object.entries(timeSlots)
        .filter(([, count]) => count > 0) // 只显示有预约的时间段
        .map(([hour, count]) => ({
          hour: parseInt(hour),
          label: `${hour}:00`,
          count,
          percentage: maxCount > 0 ? Math.round((count / maxCount) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count) // 按预约次数排序
        .slice(0, 8); // 限制显示前8个时间段
    },

    // 新增：身体部位焦点
    bodyPartFocus() {
      const bodyParts = {
        'Upper Body': { count: 0, icon: '💪', description: 'Chest, Arms, Shoulders' },
        'Lower Body': { count: 0, icon: '🦵', description: 'Legs, Glutes, Calves' },
        'Core': { count: 0, icon: '🏃', description: 'Abs, Back, Core' },
        'Cardio': { count: 0, icon: '❤️', description: 'Heart, Endurance' },
        'Full Body': { count: 0, icon: '🏋️', description: 'Complete Workout' }
      };

      this.periodBookings.forEach(booking => {
        const equipment = this.equipmentMap[booking.equipmentId];
        if (equipment && equipment.tags) {
          const tags = equipment.tags.map(tag => tag.toLowerCase());

          if (tags.some(tag => ['chest', 'arms', 'shoulders', 'bench', 'press'].includes(tag))) {
            bodyParts['Upper Body'].count++;
          } else if (tags.some(tag => ['legs', 'squat', 'deadlift', 'glutes'].includes(tag))) {
            bodyParts['Lower Body'].count++;
          } else if (tags.some(tag => ['core', 'abs', 'back', 'plank'].includes(tag))) {
            bodyParts['Core'].count++;
          } else if (tags.some(tag => ['cardio', 'treadmill', 'bike', 'elliptical'].includes(tag))) {
            bodyParts['Cardio'].count++;
          } else {
            bodyParts['Full Body'].count++;
          }
        }
      });

      const total = Object.values(bodyParts).reduce((sum, part) => sum + part.count, 0);

      return Object.entries(bodyParts)
        .map(([name, data]) => ({
          name,
          icon: data.icon,
          description: data.description,
          percentage: total > 0 ? Math.round((data.count / total) * 100) : 0
        }))
        .filter(part => part.percentage > 0)
        .sort((a, b) => b.percentage - a.percentage);
    },

    // 新增：每周活动模式
    weeklyActivity() {
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayCounts = [0, 0, 0, 0, 0, 0, 0];

      this.periodBookings.forEach(booking => {
        const dayOfWeek = booking.startTime.getDay();
        dayCounts[dayOfWeek]++;
      });

      const maxCount = Math.max(...dayCounts);

      return weekDays.map((name, index) => ({
        name,
        count: dayCounts[index],
        height: maxCount > 0 ? Math.round((dayCounts[index] / maxCount) * 100) : 0
      }));
    },

    // 新增：总结统计
    summaryStats() {
      const totalBookings = this.periodBookings.length;
      const activeSessions = this.periodBookings.filter(booking => booking.status === 'active').length;

      // 计算平均会话时长
      const totalDuration = this.periodBookings.reduce((sum, booking) => {
        return sum + (booking.endTime - booking.startTime);
      }, 0);

      const avgDurationMs = totalBookings > 0 ? totalDuration / totalBookings : 0;
      const avgDuration = Math.round(avgDurationMs / (1000 * 60)); // 转换为分钟

      // 计算一致性分数（基于每周活动）
      const weeklyActivity = this.weeklyActivity;
      const activeDays = weeklyActivity.filter(day => day.count > 0).length;
      const consistencyScore = Math.round((activeDays / 7) * 100);

      return {
        totalBookings,
        activeSessions,
        avgDuration: `${avgDuration} min`,
        consistencyScore
      };
    }
  },
  async mounted() {
    // 获取当前登录用户
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error("No user logged in");
        // 重定向到登录页
        window.location.href = '/login';
        return;
      }
      this.userId = userId;
      console.log('Current user ID:', this.userId);
      await this.loadBookings();
    } catch (error) {
      console.error("Failed to initialize:", error);
    }
  },
  beforeDestroy() {
    if (this.unsubscribeBookings) {
      this.unsubscribeBookings();
    }
  },
  methods: {
    async loadBookings() {
      const service = FirebaseService.getInstance();

      try {
        console.log('Loading bookings for user:', this.userId);

        // 1. 加载设备信息
        const allEquipment = await service.loadAllEquipment();
        console.log('Loaded equipment:', allEquipment.length, 'items');
        const equipmentMap = {};
        allEquipment.forEach(eq => {
          equipmentMap[eq.id] = eq;
        });
        this.equipmentMap = equipmentMap;

        // 2. 设置预订监听器
        this.unsubscribeBookings = service.streamBookingsByUser(
          this.userId,
          this.handleBookings
        );
        console.log('Booking listener set up for user:', this.userId);
      } catch (error) {
        console.error("Failed to load bookings:", error);
      }
    },

    handleBookings(bookings) {
      console.log('Received bookings from stream:', bookings.length, 'items');
      console.log('Raw bookings data:', bookings);

      const now = new Date();
      const service = FirebaseService.getInstance();
      // 3. 转换时间戳并排序
      this.bookings = bookings
        .map(booking => {
          try {
            // 时间戳转换
            const startTime = booking.startTime instanceof Date
              ? booking.startTime
              : booking.startTime.toDate();
            const endTime = booking.endTime instanceof Date
              ? booking.endTime
              : booking.endTime.toDate();
            // 自动完成逻辑
            if (booking.status === 'active' && endTime < now) {
              // 前端显示变 complete
              booking.status = 'completed';
              // 同步写回数据库
              const updatedBooking = new Booking({
                ...booking,
                startTime,
                endTime,
                status: 'completed',
              });
              service.updateBooking(updatedBooking);
            }
            return {
              ...booking,
              startTime,
              endTime
            };
          } catch (e) {
            console.error("Error processing booking:", booking, e);
            return null;
          }
        })
        .filter(booking => booking !== null)
        .sort((a, b) => a.startTime - b.startTime);

      console.log("Processed bookings:", this.bookings);
      console.log("Booking statuses:", this.bookings.map(b => ({ id: b.id, status: b.status })));
      console.log("Paginated bookings:", this.paginatedBookings);
    },

    async toggleBookingStatus(booking) {
      const service = FirebaseService.getInstance();
      const newStatus = booking.status === 'cancelled' ? 'active' : 'cancelled';

      try {
        console.log('Updating booking status:', booking.id, 'from', booking.status, 'to', newStatus);

        // 创建更新后的Booking实例
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

        // 使用正确的updateBooking方法
        await service.updateBooking(updatedBooking);
        console.log('Booking status updated successfully:', booking.id, 'to', newStatus);
      } catch (error) {
        console.error('Error updating booking status:', error);
        alert('Failed to update booking status. Please try again.');
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    // 新增：设置状态筛选
    setStatusFilter(status) {
      this.statusFilter = status;
      this.currentPage = 1; // 重置到第一页
      console.log('Status filter changed to:', status);
    },

    // 新增：设置时间周期
    setTimePeriod(period) {
      this.selectedPeriod = period;
      console.log('Time period changed to:', period);
    },

    formatDate(date) {
      // 5. 处理不同类型的日期对象
      const dateObj = date instanceof Date ? date : date.toDate();
      return dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    // 6. 设备信息获取方法
    getEquipmentName(equipmentId) {
      return this.equipmentMap[equipmentId]?.name || 'Unknown Equipment';
    },

    getEquipmentTags(equipmentId) {
      return this.equipmentMap[equipmentId]?.tags?.join(', ') || '';
    },

    getEquipmentImage(equipmentId) {
      return this.equipmentMap[equipmentId]?.imageUrl || '/src/assets/placeholder.png';
    }
  },
  template: scheduleTemplate
};
