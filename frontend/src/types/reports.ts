export interface ReportPeriod {
  type: 'monthly' | 'annual'
  startDate: string
  endDate: string
  label: string
}

export interface IndoorOutdoorStats {
  activities: number
  distance: number
  duration: number
  elevation: number
  trimp: number
}

export interface ReportSummary {
  totalActivities: number
  totalDistance: number
  totalDuration: number
  totalElevation: number
  totalCalories: number
  totalTrimp: number
  averageHeartRate: number | null
  averageSpeed: number | null
  indoor: IndoorOutdoorStats
  outdoor: IndoorOutdoorStats
}

export interface HeartRateZoneDefinition {
  zone: number
  name: string
  description: string
  min: number
  max: number
  color: string
}

export interface ReportZoneDistribution {
  zone: number
  name: string
  description: string
  min: number
  max: number
  color: string
  seconds: number
  hours: number
  percentage: number
}

export interface PolarizationSummary {
  totals: {
    low: number
    moderate: number
    high: number
  }
  percentages: {
    low: number
    moderate: number
    high: number
  }
  target: {
    low: number
    moderate: number
    high: number
  }
  score: number
  focus: string
  message: string
}

export interface TrainingLoadData {
  date: string
  trimp: number
  ctl: number
  atl: number
  tsb: number
}

export interface ReportTrainingLoad {
  startCtl: number
  endCtl: number
  ctlChange: number
  startAtl: number
  endAtl: number
  atlChange: number
  history: TrainingLoadData[]
}

export interface ReportActivity {
  id: number
  date: string
  type: string
  subSport: string | null
  distance: number
  duration: number
  trimp: number | null
  elevationGain: number | null
  avgHeartRate: number | null
  avgSpeed: number | null
}

export interface ReportTopActivities {
  byDistance: ReportActivity[]
  byDuration: ReportActivity[]
  byTrimp: ReportActivity[]
  byElevation: ReportActivity[]
}

export interface ReportRecord {
  id: number
  recordType: string
  recordTypeName: string
  activityType: string
  value: number
  unit: string
  achievedAt: string
  previousValue: number | null
  improvement: number | null
}

export interface ReportRecords {
  new: ReportRecord[]
  improved: ReportRecord[]
}

export interface ReportTypeSummary {
  type: string
  count: number
  distance: number
  duration: number
  trimp: number
  indoor: number
  outdoor: number
}

export interface MonthlyBreakdown {
  month: number
  monthName: string
  activities: number
  distance: number
  duration: number
  elevation: number
  trimp: number
  avgSpeed: number | null
  avgHeartRate: number | null
}

export interface ReportData {
  period: ReportPeriod
  summary: ReportSummary
  heartRateZones: HeartRateZoneDefinition[]
  zoneDistribution: ReportZoneDistribution[]
  polarization: PolarizationSummary
  trainingLoad: ReportTrainingLoad
  topActivities: ReportTopActivities
  records: ReportRecords
  byType: ReportTypeSummary[]
  activitiesCount: {
    indoor: number
    outdoor: number
    total: number
  }
  monthlyBreakdown?: MonthlyBreakdown[]
}
