// src/i18n/schedule.js
export default {
    en: {
      heroTitle: "YOUR BOOKING SCHEDULE",
      filterStatus: "Filter by Status:",
      all: "All",
      active: "Active",
      completed: "Completed",
      cancelled: "Cancelled",
      bookingsCount: "{count} of {total} bookings",
      equipment: "Equipment",
      startTime: "Start Time",
      endTime: "End Time",
      status: "Status",
      action: "Action",
      noBookings: "No bookings found",
      unknownEquipment: "Unknown Equipment",
      restore: "Restore",
      cancel: "Cancel",
      previous: "Previous",
      next: "Next",
      pageIndicator: "Page {current} of {total}",
      analyticsTitle: "Your Workout Analytics",
      analyticsSubtitle: "Discover your fitness patterns and preferences",
      timePeriods: [
        { value: 'week', label: 'Last Week' },
        { value: 'month', label: 'Last Month' },
        { value: 'quarter', label: 'Last 3 Months' },
        { value: 'year', label: 'Last Year' }
      ],
      mostBooked: "Most Booked Equipment",
      bookings: "bookings",
      timePreferences: "Preferred Workout Times",
      bodyFocus: "Body Part Focus",
      weeklyActivity: "Weekly Activity Pattern",
      summary: "Summary",
      totalBookings: "Total Bookings",
      activeSessions: "Active Sessions",
      avgDuration: "Avg. Session Duration",
      consistencyScore: "Consistency Score",
      noDataTitle: "No Data Available",
      noDataMessage: "Start booking equipment to see your workout analytics here.",
      bookEquipment: "Book Equipment",
      bodyParts: {
        'Upper Body': { 
          name: 'Upper Body',
          icon: '💪', 
          description: 'Focus on chest, arms and shoulders' 
        },
        'Lower Body': { 
          name: 'Lower Body',
          icon: '🦵', 
          description: 'Focus on legs, glutes and calves' 
        },
        'Core': { 
          name: 'Core',
          icon: '🏃', 
          description: 'Focus on abs, back and core muscles' 
        },
        'Cardio': { 
          name: 'Cardio',
          icon: '❤️', 
          description: 'Heart rate and endurance training' 
        },
        'Full Body': { 
          name: 'Full Body',
          icon: '🏋️', 
          description: 'Complete full-body workout' 
        }
      }
    },
    
    zh: {
      heroTitle: "您的预约日程",
      filterStatus: "按状态筛选:",
      all: "全部",
      active: "有效",
      completed: "已完成",
      cancelled: "已取消",
      bookingsCount: "{count}/{total} 条预约",
      equipment: "设备",
      startTime: "开始时间",
      endTime: "结束时间",
      status: "状态",
      action: "操作",
      noBookings: "未找到预约记录",
      unknownEquipment: "未知设备",
      restore: "恢复",
      cancel: "取消",
      previous: "上一页",
      next: "下一页",
      pageIndicator: "第 {current} 页，共 {total} 页",
      analyticsTitle: "您的健身数据分析",
      analyticsSubtitle: "发现您的健身模式和偏好",
      timePeriods: [
        { value: 'week', label: '最近一周' },
        { value: 'month', label: '最近一月' },
        { value: 'quarter', label: '最近三月' },
        { value: 'year', label: '最近一年' }
      ],
      mostBooked: "最常预约的设备",
      bookings: "次预约",
      timePreferences: "偏好的锻炼时间",
      bodyFocus: "身体部位焦点",
      weeklyActivity: "每周活动模式",
      summary: "总结",
      totalBookings: "总预约数",
      activeSessions: "有效课程",
      avgDuration: "平均课程时长",
      consistencyScore: "坚持度评分",
      noDataTitle: "暂无数据",
      noDataMessage: "开始预约设备以查看您的健身分析数据。",
      bookEquipment: "预约设备",
      bodyParts: {
        'Upper Body': { 
          name: '上肢训练',
          icon: '💪',
          description: '专注于胸部、手臂和肩膀' 
        },
        'Lower Body': { 
          name: '下肢训练',
          icon: '🦵',
          description: '专注于腿部、臀部和 calves' 
        },
        'Core': { 
          name: '核心训练',
          icon: '🏃',
          description: '专注于腹部、背部和核心肌群' 
        },
        'Cardio': { 
          name: '心肺训练',
          icon: '❤️',
          description: '心率和耐力训练' 
        },
        'Full Body': { 
          name: '全身训练',
          icon: '🏋️',
          description: '完整的全身锻炼' 
        }
    }
  }
}