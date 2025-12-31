import { useEffect, useState } from 'react'
import {
  FileDown,
  FileText,
  Loader2,
  Calendar,
  CalendarDays,
  ChevronDown,
  FileBarChart,
  AlertCircle
} from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import { PageHeader } from '../components/ui/PageHeader'
import {
  ReportSummary,
  ReportIndoorOutdoor,
  ReportZonesChart,
  ReportPolarization,
  ReportTrainingLoad,
  ReportTopActivities,
  ReportRecords,
  ReportByType,
  ReportMonthlyComparison,
} from '../components/reports'
import { reportsApi } from '../services/reportsApi'
import { exportReportToPdf, exportReportToHtml } from '../utils/reportExport'
import type { ReportData } from '../types/reports'
import toast from 'react-hot-toast'

const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 6 }, (_, i) => currentYear + i)

export default function Reports() {
  const [reportType, setReportType] = useState<'monthly' | 'annual'>('monthly')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState<'pdf' | 'html' | null>(null)

  useEffect(() => {
    fetchReport()
  }, [reportType, selectedMonth, selectedYear])

  const fetchReport = async () => {
    setLoading(true)
    try {
      let data: ReportData
      if (reportType === 'monthly') {
        data = await reportsApi.getMonthlyReport(selectedMonth, selectedYear)
      } else {
        data = await reportsApi.getAnnualReport(selectedYear)
      }
      setReport(data)
    } catch (error) {
      console.error('Erreur lors du chargement du rapport:', error)
      toast.error('Erreur lors du chargement du rapport')
    } finally {
      setLoading(false)
    }
  }

  const handleExportPdf = () => {
    if (!report) return
    setExporting('pdf')
    try {
      const filename = `rapport-${report.period.type === 'monthly' ? 'mensuel' : 'annuel'}-${report.period.label.replace(/\s/g, '-').toLowerCase()}.pdf`
      exportReportToPdf(report, filename)
      toast.success('PDF exporté avec succès')
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error)
      toast.error('Erreur lors de l\'export PDF')
    } finally {
      setExporting(null)
    }
  }

  const handleExportHtml = () => {
    if (!report) return
    setExporting('html')
    try {
      const filename = `rapport-${report.period.type === 'monthly' ? 'mensuel' : 'annuel'}-${report.period.label.replace(/\s/g, '-').toLowerCase()}.html`
      exportReportToHtml(report, filename)
      toast.success('HTML exporté avec succès')
    } catch (error) {
      console.error('Erreur lors de l\'export HTML:', error)
      toast.error('Erreur lors de l\'export HTML')
    } finally {
      setExporting(null)
    }
  }

  return (
    <AppLayout
      title="Rapports"
      description="Générez des rapports d'analyse de vos activités"
      actions={
        report && report.summary.totalActivities > 0 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={exporting !== null}
              className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8BC34A] to-[#7CB342] text-black rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#8BC34A]/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting === 'pdf' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              )}
              Exporter PDF
            </button>
            <button
              type="button"
              onClick={handleExportHtml}
              disabled={exporting !== null}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-xl font-medium border border-white/10 transition-all duration-300 hover:bg-white/15 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting === 'html' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              HTML
            </button>
          </div>
        )
      }
    >
      <PageHeader
        eyebrow="Analyse"
        title="Rapports d'Activités"
        description="Consultez vos statistiques mensuelles ou annuelles et exportez-les"
        icon="📊"
        gradient="from-emerald-500 to-teal-600"
      />

      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        {/* Report type toggle */}
        <div className="flex p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => setReportType('monthly')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              reportType === 'monthly'
                ? 'bg-gradient-to-r from-[#8BC34A] to-[#7CB342] text-black shadow-lg shadow-[#8BC34A]/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Mensuel
          </button>
          <button
            type="button"
            onClick={() => setReportType('annual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              reportType === 'annual'
                ? 'bg-gradient-to-r from-[#8BC34A] to-[#7CB342] text-black shadow-lg shadow-[#8BC34A]/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Annuel
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-white/10 hidden sm:block" />

        {/* Month selector */}
        {reportType === 'monthly' && (
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              aria-label="Sélectionner le mois"
              className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-[#8BC34A]/50 focus:ring-2 focus:ring-[#8BC34A]/20 transition-all cursor-pointer"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1} className="bg-[#0c1017] text-white">
                  {month}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        )}

        {/* Year selector */}
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            aria-label="Sélectionner l'année"
            className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-[#8BC34A]/50 focus:ring-2 focus:ring-[#8BC34A]/20 transition-all cursor-pointer"
          >
            {years.map((year) => (
              <option key={year} value={year} className="bg-[#0c1017] text-white">
                {year}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Report content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-[#8BC34A]/20" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-[#8BC34A] animate-spin" />
          </div>
          <p className="mt-4 text-gray-400 font-medium">Génération du rapport...</p>
        </div>
      ) : report ? (
        <div id="report-content" className="space-y-10">
          {/* Report header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 p-6">
            {/* Background glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#8BC34A]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-[#8BC34A] to-[#7CB342] shadow-lg shadow-[#8BC34A]/25">
                  <FileBarChart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {report.period.label}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Du {new Date(report.period.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au{' '}
                    {new Date(report.period.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {report.summary.totalActivities > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8BC34A]/10 border border-[#8BC34A]/30">
                  <span className="text-2xl font-bold text-[#8BC34A]">
                    {report.summary.totalActivities}
                  </span>
                  <span className="text-sm text-gray-400">
                    activité{report.summary.totalActivities > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {report.summary.totalActivities === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10">
              <div className="p-4 rounded-full bg-amber-500/10 mb-4">
                <AlertCircle className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Aucune activité enregistrée
              </h3>
              <p className="text-gray-400 text-center max-w-md">
                Importez des activités pour cette période afin de générer un rapport détaillé de vos performances.
              </p>
            </div>
          ) : (
            <>
              <ReportSummary summary={report.summary} />
              {/* Analyse mensuelle pour rapport annuel */}
              {report.period.type === 'annual' && report.monthlyBreakdown && (
                <ReportMonthlyComparison monthlyBreakdown={report.monthlyBreakdown} />
              )}
              <ReportIndoorOutdoor
                indoor={report.summary.indoor}
                outdoor={report.summary.outdoor}
                total={{
                  activities: report.summary.totalActivities,
                  distance: report.summary.totalDistance,
                  duration: report.summary.totalDuration,
                  elevation: report.summary.totalElevation,
                  trimp: report.summary.totalTrimp,
                }}
              />
              <ReportZonesChart zones={report.zoneDistribution} />
              <ReportPolarization polarization={report.polarization} />
              <ReportTrainingLoad trainingLoad={report.trainingLoad} />
              <ReportTopActivities topActivities={report.topActivities} />
              <ReportRecords records={report.records} />
              <ReportByType byType={report.byType} activitiesCount={report.activitiesCount} />
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10">
          <div className="p-4 rounded-full bg-white/5 mb-4">
            <Calendar className="w-10 h-10 text-gray-500" />
          </div>
          <p className="text-gray-400">
            Sélectionnez une période pour générer un rapport.
          </p>
        </div>
      )}
    </AppLayout>
  )
}
