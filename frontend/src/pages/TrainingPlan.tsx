import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import AppLayout from "../components/layout/AppLayout";
import { PageHeader } from "../components/ui/PageHeader";
import api from "../services/api";
import type {
  LoadedTrainingPlan,
  ManualSessionConfig,
  SavedTrainingPlan,
} from "../store/trainingPlanStore";
import { useTrainingPlanStore } from "../store/trainingPlanStore";

interface PlannedSession {
  day: string;
  dayOfWeek: number;
  type: string;
  intensity: "recovery" | "easy" | "moderate" | "hard" | "very_hard";
  duration: number;
  distance?: number;
  description: string;
  targetHRZone?: number;
  estimatedTrimp: number;
}

interface WeeklyPlan {
  weekNumber: number;
  startDate: string;
  endDate: string;
  totalLoad: number;
  sessions: PlannedSession[];
  focus: string;
  notes: string;
}

interface EnrichedManualSession extends ManualSessionConfig {
  displayName: string;
  icon: string;
}

interface SavedWeekRowPreview {
  dayLabel: string;
  dayIndex: number;
  isSelected: boolean;
  sessions: EnrichedManualSession[];
  durationsLabel: string;
  totalDuration: number;
}

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const DAYS_FULL = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

const DEFAULT_BADGE_CLASSES =
  "inline-flex items-center gap-2 rounded-2xl border border-panel-border/60 bg-bg-elevated/80 px-3 py-1 text-xs font-semibold text-text-primary dark:border-dark-border dark:bg-dark-surface dark:text-dark-text-contrast";

const ACTIVITIES = [
  { id: "Course", name: "Course à pied", icon: "🏃" },
  { id: "Cyclisme", name: "Cyclisme", icon: "🚴" },
  { id: "HIIT", name: "HIIT", icon: "💪" },
  { id: "Marche", name: "Marche", icon: "🚶" },
  { id: "Musculation", name: "Musculation", icon: "🏋️" },
  { id: "Natation", name: "Natation", icon: "🏊" },
  { id: "Rameur", name: "Rameur", icon: "🚣" },
  { id: "Randonnée", name: "Randonnée", icon: "🥾" },
  { id: "Yoga", name: "Yoga", icon: "🧘" },
];

const GOALS = [
  {
    id: "maintain",
    name: "Maintenir",
    icon: "🎯",
    desc: "Stabiliser votre forme actuelle",
  },
  {
    id: "improve",
    name: "Progresser",
    icon: "🌿",
    desc: "Monter en charge progressivement",
  },
  {
    id: "peak",
    name: "Pic de forme",
    icon: "🏔️",
    desc: "Préparer un objectif clé",
  },
];

const INTENSITY_TOKENS: Record<
  string,
  {
    label: string;
    gradient: string;
    textClass: string;
    border: string;
    description: string;
  }
> = {
  recovery: {
    label: "Récup",
    gradient: "from-[#E4F1DB] to-[#D1E0C8]",
    textClass: "text-intensity-recovery",
    border: "border-[#AEC79A]",
    description: "Séance très douce pour assimiler",
  },
  easy: {
    label: "Facile",
    gradient: "from-[#F0F7DA] to-[#E2EECC]",
    textClass: "text-intensity-easy",
    border: "border-[#CBDFA7]",
    description: "Endurance fondamentale",
  },
  moderate: {
    label: "Modéré",
    gradient: "from-[#FDF0DB] to-[#F3E0C3]",
    textClass: "text-intensity-moderate",
    border: "border-[#E5C9A1]",
    description: "Travail soutenu contrôlé",
  },
  hard: {
    label: "Dur",
    gradient: "from-[#FBE2D2] to-[#F1CDBA]",
    textClass: "text-intensity-hard",
    border: "border-[#E9B198]",
    description: "Session intense structurée",
  },
  very_hard: {
    label: "Intense",
    gradient: "from-[#F5D7D1] to-[#EFBEB7]",
    textClass: "text-intensity-very-hard",
    border: "border-[#E59A8F]",
    description: "Travail maximal à gérer",
  },
};

const FOCUS_TOKENS: Record<string, { icon: string; label: string }> = {
  base: { icon: "🌱", label: "Base aérobie" },
  build: { icon: "🌿", label: "Montée en charge" },
  intensification: { icon: "🔥", label: "Intensification" },
  peak: { icon: "🏔️", label: "Affûtage" },
  recovery: { icon: "🧘", label: "Récupération active" },
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins}min`;
  return `${hours}h${
    mins > 0 ? ` ${mins.toString().padStart(2, "0")}min` : ""
  }`;
};

const toLocaleDate = (value?: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(parsed);
};

const normalizeFocus = (value?: string) =>
  value
    ? value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
    : "";

export default function TrainingPlan() {
  const [plan, setPlan] = useState<WeeklyPlan[]>([]);
  const [nextSession, setNextSession] = useState<PlannedSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(0);

  const [goal, setGoal] = useState("improve");
  const [weeklyHours, setWeeklyHours] = useState(6);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]);
  const [activityType, setActivityType] = useState("Cyclisme");
  const [manualSchedule, setManualSchedule] = useState<
    Record<number, ManualSessionConfig[]>
  >({});
  const [manualChoice, setManualChoice] = useState<Record<number, string>>({});
  const [manualDurationChoice, setManualDurationChoice] = useState<
    Record<number, number>
  >({});
  const [savedPlansList, setSavedPlansList] = useState<SavedTrainingPlan[]>([]);
  const [currentPlanName, setCurrentPlanName] = useState<string | null>(null);
  const [showSavedPlans, setShowSavedPlans] = useState(false);

  const { savedWeek, saveWeek, clearWeek, setCurrentPlanId, setSavedPlans } =
    useTrainingPlanStore();

  useEffect(() => {
    loadNextSession();
    loadActivePlan();
    loadSavedPlansList();
  }, []);

  useEffect(() => {
    if (plan.length) {
      setSelectedWeek(0);
    }
  }, [plan.length]);

  const planStats = useMemo(() => {
    if (!plan.length) {
      return { weeks: 0, sessions: 0, hours: 0, load: 0 };
    }
    const sessions = plan.reduce((sum, week) => sum + week.sessions.length, 0);
    const minutes = plan.reduce(
      (sum, week) =>
        sum + week.sessions.reduce((acc, session) => acc + session.duration, 0),
      0
    );
    const load = plan.reduce((sum, week) => sum + week.totalLoad, 0);
    return {
      weeks: plan.length,
      sessions,
      hours: Math.round(minutes / 60),
      load,
    };
  }, [plan]);

  const activityDictionary = useMemo(
    () =>
      ACTIVITIES.reduce<Record<string, { name: string; icon: string }>>(
        (acc, activity) => {
          acc[activity.id] = { name: activity.name, icon: activity.icon };
          return acc;
        },
        {}
      ),
    []
  );

  const savedWeekRows = useMemo<SavedWeekRowPreview[]>(() => {
    if (!savedWeek) return [];
    return DAYS_FULL.map((dayLabel, dayIndex) => {
      const sessions = savedWeek.manualSchedule?.[dayIndex] || [];
      const enrichedSessions: EnrichedManualSession[] = sessions.map(
        (session) => {
          const details = activityDictionary[session.type] || {
            name: session.type,
            icon: "🏋️",
          };
          return {
            ...session,
            displayName: details.name,
            icon: details.icon,
          };
        }
      );
      const durations = sessions
        .map((session) => session.duration)
        .filter(
          (value): value is number => typeof value === "number" && value > 0
        );

      const durationsLabel = enrichedSessions.length
        ? enrichedSessions
            .map((session) =>
              session.duration ? formatDuration(session.duration) : "Libre"
            )
            .join(" + ")
        : savedWeek.selectedDays.includes(dayIndex)
        ? "À définir"
        : "Repos";

      return {
        dayLabel,
        dayIndex,
        sessions: enrichedSessions,
        isSelected: savedWeek.selectedDays.includes(dayIndex),
        durationsLabel,
        totalDuration: durations.reduce((sum, current) => sum + current, 0),
      };
    });
  }, [activityDictionary, savedWeek]);

  const savedWeekTotalDuration = useMemo(
    () => savedWeekRows.reduce((sum, row) => sum + row.totalDuration, 0),
    [savedWeekRows]
  );

  const savedWeekGoalMeta = useMemo(() => {
    if (!savedWeek) return null;
    return GOALS.find((goalOption) => goalOption.id === savedWeek.goal) ?? null;
  }, [savedWeek]);

  const getSavedWeekRowNote = (row: SavedWeekRowPreview) => {
    if (!savedWeek) return "";
    if (!row.isSelected) {
      return "Repos / écoutez vos sensations";
    }
    if (row.sessions.length) {
      return savedWeekGoalMeta
        ? `Séance personnalisée • ${savedWeekGoalMeta.name}`
        : "Séance personnalisée";
    }
    return `Créneau flexible (${savedWeek.activityType})`;
  };

  const loadNextSession = async () => {
    try {
      const res = await api.get("/api/training-plans/next-session");
      if (res.data.data) {
        setNextSession(res.data.data);
      }
    } catch (error) {
      console.error("Erreur chargement recommandation:", error);
    }
  };

  const loadActivePlan = async () => {
    try {
      const res = await api.get("/api/training-plans/load");
      if (res.data.data) {
        const loadedPlan: LoadedTrainingPlan = res.data.data;
        setPlan(loadedPlan.plan);
        setGoal(loadedPlan.goal);
        setWeeklyHours(loadedPlan.weeklyHours);
        setActivityType(loadedPlan.mainActivityType);
        setSelectedDays(loadedPlan.preferredDays);
        setCurrentPlanId(loadedPlan.id);
        setCurrentPlanName(loadedPlan.name);
      }
    } catch (error) {
      console.error("Erreur chargement plan actif:", error);
    }
  };

  const loadSavedPlansList = async () => {
    try {
      const res = await api.get("/api/training-plans/list");
      if (res.data.data) {
        setSavedPlansList(res.data.data);
        setSavedPlans(res.data.data);
      }
    } catch (error) {
      console.error("Erreur chargement liste des plans:", error);
    }
  };

  const loadSpecificPlan = async (planId: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/training-plans/load/${planId}`);
      if (res.data.data) {
        const loadedPlan: LoadedTrainingPlan = res.data.data;
        setPlan(loadedPlan.plan);
        setGoal(loadedPlan.goal);
        setWeeklyHours(loadedPlan.weeklyHours);
        setActivityType(loadedPlan.mainActivityType);
        setSelectedDays(loadedPlan.preferredDays);
        setCurrentPlanId(loadedPlan.id);
        setCurrentPlanName(loadedPlan.name);
        setShowSavedPlans(false);
        toast.success(`Plan "${loadedPlan.name}" chargé`);
      }
    } catch (error) {
      console.error("Erreur chargement plan:", error);
      toast.error("Impossible de charger ce plan");
    } finally {
      setLoading(false);
    }
  };

  const deleteSavedPlan = async (planId: number) => {
    try {
      await api.delete(`/api/training-plans/${planId}`);
      toast.success("Plan supprimé");
      loadSavedPlansList();
    } catch (error) {
      console.error("Erreur suppression plan:", error);
      toast.error("Impossible de supprimer ce plan");
    }
  };

  const toggleDay = (dayIndex: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort((a, b) => a - b)
    );
    setManualSchedule((prev) => {
      if (!prev[dayIndex]) return prev;
      const { [dayIndex]: _, ...rest } = prev;
      return rest;
    });
    setManualChoice((prev) => {
      if (prev[dayIndex] === undefined) return prev;
      const { [dayIndex]: _, ...rest } = prev;
      return rest;
    });
    setManualDurationChoice((prev) => {
      if (prev[dayIndex] === undefined) return prev;
      const { [dayIndex]: _, ...rest } = prev;
      return rest;
    });
  };

  const addManualActivity = (
    dayIndex: number,
    activityId: string,
    duration: number
  ) => {
    if (!activityId) return;
    const safeDuration =
      Number.isFinite(duration) && duration > 0 ? duration : undefined;
    setManualSchedule((prev) => {
      const current = prev[dayIndex] || [];
      return {
        ...prev,
        [dayIndex]: [...current, { type: activityId, duration: safeDuration }],
      };
    });
  };

  const removeManualActivity = (dayIndex: number, activityIndex: number) => {
    setManualSchedule((prev) => {
      const current = prev[dayIndex];
      if (!current) return prev;
      const updated = current.filter((_, idx) => idx !== activityIndex);
      return { ...prev, [dayIndex]: updated };
    });
  };

  const handleManualChoice = (dayIndex: number, activityId: string) => {
    setManualChoice((prev) => ({ ...prev, [dayIndex]: activityId }));
    // Default duration 60min if not set
    if (!manualDurationChoice[dayIndex]) {
      setManualDurationChoice((prev) => ({ ...prev, [dayIndex]: 60 }));
    }
  };

  const handleManualDuration = (dayIndex: number, duration: number) => {
    setManualDurationChoice((prev) => ({ ...prev, [dayIndex]: duration }));
  };

  useEffect(() => {
    loadNextSession();
    loadActivePlan();
    loadSavedPlansList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Handlers ---

  const handleGeneratePlan = async () => {
    if (!goal || !activityType || !weeklyHours || selectedDays.length === 0) {
      toast.error("Veuillez remplir tous les champs du profil.");
      return;
    }

    setLoading(true);
    try {
      // 1. Generate plan via backend
      const response = await fetch("http://localhost:3333/api/training-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          activityType,
          weeklyHours,
          daysPerWeek: selectedDays,
          manualSchedule,
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la génération");
      const data = await response.json();
      setPlan(data.weeks);

      // 2. Save automatically
      const savePayload = {
        name: `Plan ${new Date().toLocaleDateString()}`,
        goal,
        weeklyHours,
        mainActivityType: activityType,
        startDate: new Date().toISOString(),
        endDate: new Date(
          Date.now() + 4 * 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        weeks: data.weeks,
      };

      const saveRes = await fetch(
        "http://localhost:3333/api/training-plans/save",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(savePayload),
        }
      );
      if (saveRes.ok) {
        toast.success("Plan généré et sauvegardé !");
        loadSavedPlansList();
        loadActivePlan();
      }
    } catch (err) {
      console.error(err);
      toast.error("Impossible de générer le plan.");
    } finally {
      setLoading(false);
    }
  };

  const updateManualActivityDuration = (
    dayIndex: number,
    activityIndex: number,
    duration: number
  ) => {
    setManualSchedule((prev) => {
      const current = prev[dayIndex];
      if (!current) return prev;
      const updated = [...current];
      updated[activityIndex] = {
        ...updated[activityIndex],
        duration:
          Number.isFinite(duration) && duration > 0 ? duration : undefined,
      };
      return { ...prev, [dayIndex]: updated };
    });
  };

  // addManualActivity is already defined above, removing duplicate here if it exists in previous context
  // Checking previous context, it seems I might have introduced duplicates.
  // I will ensure only one definition exists.

  const validateManualChoice = (dayIndex: number) => {
    const activityId = manualChoice[dayIndex];
    const duration = manualDurationChoice[dayIndex];
    if (!activityId) return;
    if (!duration || duration < 10) {
      toast.error("Définissez une durée valide (min)");
      return;
    }
    addManualActivity(dayIndex, activityId, duration);
    setManualChoice((prev) => ({ ...prev, [dayIndex]: "" }));
    setManualDurationChoice((prev) => ({ ...prev, [dayIndex]: duration }));
  };

  const handleSaveWeek = () => {
    if (selectedDays.length === 0) {
      toast.error("Sélectionnez au moins un jour.");
      return;
    }

    const weekData = {
      goal,
      activityType,
      weeklyHours,
      selectedDays,
      manualSchedule,
    };
    localStorage.setItem("savedWeek", JSON.stringify(weekData));
    saveWeek(weekData);
    toast.success("Semaine type enregistrée localement !");
  };

  const handleLoadSavedWeek = () => {
    const saved = localStorage.getItem("savedWeek");
    if (saved) {
      const parsed = JSON.parse(saved);
      setGoal(parsed.goal);
      setActivityType(parsed.activityType);
      setWeeklyHours(parsed.weeklyHours);
      setSelectedDays(parsed.selectedDays);
      setManualSchedule(parsed.manualSchedule);
      toast.success("Semaine type chargée !");
    } else {
      toast.error("Aucune semaine enregistrée.");
    }
  };

  const handleClearSavedWeek = () => {
    localStorage.removeItem("savedWeek");
    clearWeek();
    toast.success("Semaine enregistrée supprimée.");
  };

  // --- Render Helpers ---

  const getFocusToken = (focus?: string) => {
    const normalized = normalizeFocus(focus);
    return (
      FOCUS_TOKENS[normalized] || {
        icon: "🗺️",
        label: focus || "Semaine structurée",
      }
    );
  };

  const getIntensityToken = (intensity: string) =>
    INTENSITY_TOKENS[intensity] || INTENSITY_TOKENS.moderate;

  // --- Derived State for Saved Week Preview ---
  // (Removed redeclared variables: savedWeekGoalMeta, savedWeekTotalDuration, savedWeekRows, getSavedWeekRowNote)

  // --- Helper Functions ---

  // Removed unused getActivityBadgeColor and buildWeekTableData functions

  const activeWeek = plan[selectedWeek];

  return (
    <AppLayout
      title="Plan d'entraînement"
      description="Créez un cycle aligné sur vos objectifs nature-friendly"
    >
      <div className="space-y-8">
        <PageHeader
          eyebrow="Planification"
          title="Plan d'entraînement"
          description="Un accompagnement semaine par semaine pour équilibrer charges, récupérations et intensités."
          icon="📅"
          gradient="from-[#8BC34A] to-[#5CE1E6]"
          accentColor="#8BC34A"
        />

        {/* Stats section */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-panel p-4 text-center">
            <p className="text-3xl font-bold text-[#8BC34A]">{planStats.weeks}</p>
            <p className="text-sm text-gray-400">Semaines prêtes</p>
          </div>
          <div className="glass-panel p-4 text-center">
            <p className="text-3xl font-bold text-[#5CE1E6]">{planStats.sessions}</p>
            <p className="text-sm text-gray-400">Sessions</p>
          </div>
          <div className="glass-panel p-4 text-center">
            <p className="text-3xl font-bold text-[#FFAB40]">{planStats.hours}h</p>
            <p className="text-sm text-gray-400">Volume total</p>
          </div>
        </div>

        <section className="glass-panel p-6">

          {nextSession ? (
            <div className="hero-reco mt-6 p-5 text-text-primary dark:text-dark-text-contrast">
              <p className="text-xs uppercase tracking-[0.35em] text-text-secondary dark:text-dark-text-secondary">
                À faire aujourd'hui
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {ACTIVITIES.find((a) => a.id === nextSession.type)?.icon ||
                      "🏋️"}
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-text-primary dark:text-dark-text-contrast">
                      {nextSession.type}
                    </p>
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                      {DAYS_FULL[nextSession.dayOfWeek]} ·{" "}
                      {formatDuration(nextSession.duration)}
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-border-base bg-bg-elevated/70 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-text-secondary dark:border-dark-border dark:bg-dark-bg dark:text-dark-text-contrast">
                  {getIntensityToken(nextSession.intensity).label}
                </span>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                  {nextSession.description}
                </p>
              </div>
              <p className="mt-2 text-xs text-text-secondary dark:text-dark-text-secondary">
                {getIntensityToken(nextSession.intensity).description}
              </p>
            </div>
          ) : (
            <div className="hero-reco mt-6 border-dashed bg-bg-elevated/70 p-5 text-sm text-text-secondary dark:bg-dark-surface dark:text-dark-text-secondary">
              Lancez la génération d’un plan pour recevoir vos recommandations
              personnalisées quotidiennes.
            </div>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
          <section className="training-plan-panel rounded-3xl border border-panel-border/60 bg-bg-elevated p-6 shadow-sm dark:border-dark-border dark:bg-dark-card space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-text-secondary dark:text-dark-text-secondary">
                Paramètres
              </p>
              <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-contrast">
                Profil du plan
              </h2>
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-text-primary dark:text-dark-text-contrast">
                Objectif
              </label>
              <div className="space-y-3">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                      goal === g.id
                        ? "border-accent bg-bg-subtle shadow-md"
                        : "border-border-base bg-bg-elevated hover:border-accent/50 dark:border-dark-border dark:bg-dark-bg"
                    }`}
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <div>
                      <p className="font-semibold text-text-primary dark:text-dark-text-contrast">
                        {g.name}
                      </p>
                      <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                        {g.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-text-primary dark:text-dark-text-contrast">
                Activité maîtresse
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ACTIVITIES.map((activity) => (
                  <button
                    key={activity.id}
                    type="button"
                    onClick={() => setActivityType(activity.id)}
                    className={`rounded-xl border-2 p-3 text-center text-xs font-medium transition ${
                      activityType === activity.id
                        ? "border-accent bg-bg-subtle"
                        : "border-border-base bg-bg-elevated hover:border-accent/50 dark:border-dark-border dark:bg-dark-bg"
                    }`}
                  >
                    <span className="text-xl">{activity.icon}</span>
                    <span className="mt-1 block text-text-primary dark:text-dark-text-contrast">
                      {activity.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-text-primary dark:text-dark-text-contrast">
                Volume hebdomadaire{" "}
                <span className="text-brand">{weeklyHours}h</span>
              </label>
              <input
                type="range"
                min={3}
                max={15}
                step={1}
                value={weeklyHours}
                onChange={(event) => setWeeklyHours(Number(event.target.value))}
                className="w-full accent-accent"
              />
              <div className="mt-2 flex justify-between text-xs text-text-secondary dark:text-dark-text-secondary">
                <span>3h</span>
                <span>9h</span>
                <span>15h</span>
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-text-primary dark:text-dark-text-contrast">
                Jours souhaités
              </label>
              <div className="grid grid-cols-7 gap-2 text-sm">
                {DAYS.map((day, index) => {
                  const active = selectedDays.includes(index);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={`rounded-xl border px-2 py-2 font-semibold transition ${
                        active
                          ? "border-accent bg-bg-subtle text-text-primary"
                          : "border-border-base bg-bg-elevated text-text-secondary hover:border-accent/50 dark:border-dark-border dark:bg-dark-bg"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDays.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text-primary dark:text-dark-text-contrast">
                      Planification manuelle
                    </p>
                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                      Choisissez les activités que vous souhaitez placer
                      manuellement chaque jour.
                    </p>
                  </div>
                  {!!Object.keys(manualSchedule).length && (
                    <button
                      type="button"
                      onClick={() => {
                        setManualSchedule({});
                        setManualChoice({});
                      }}
                      className="text-xs font-semibold text-brand hover:underline dark:text-dark-text-contrast"
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {selectedDays.map((dayIndex) => {
                    const selections = manualSchedule[dayIndex] || [];
                    return (
                      <div
                        key={`manual-${dayIndex}`}
                        className="rounded-2xl border border-border-base bg-bg-elevated p-4 dark:border-dark-border dark:bg-dark-bg"
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-text-primary dark:text-dark-text-contrast">
                              {DAYS_FULL[dayIndex]}
                            </p>
                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                              {selections.length
                                ? "Activités prévues"
                                : "Aucune activité ajoutée pour le moment"}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {selections.map((session, sessionIndex) => {
                              const activity = ACTIVITIES.find(
                                (a) => a.id === session.type
                              );
                              return (
                                <div
                                  key={`${dayIndex}-${session.type}-${sessionIndex}`}
                                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-border-base bg-bg-subtle px-3 py-2 text-xs font-semibold text-text-primary dark:border-dark-border dark:bg-dark-muted dark:text-dark-text-contrast"
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{activity?.icon || "🏋️"}</span>
                                    <span>
                                      {activity?.name || session.type}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[11px] font-medium text-text-secondary dark:text-dark-text-secondary">
                                    <label
                                      htmlFor={`duration-${dayIndex}-${sessionIndex}`}
                                      className="uppercase tracking-widest"
                                    >
                                      Durée
                                    </label>
                                    <input
                                      id={`duration-${dayIndex}-${sessionIndex}`}
                                      type="number"
                                      min={10}
                                      max={240}
                                      value={session.duration ?? ""}
                                      onChange={(event) =>
                                        updateManualActivityDuration(
                                          dayIndex,
                                          sessionIndex,
                                          Number(event.target.value)
                                        )
                                      }
                                      className="w-16 rounded-lg border border-border-base bg-bg-elevated px-2 py-1 text-xs text-text-primary outline-none focus:border-accent dark:border-dark-border dark:bg-dark-bg dark:text-dark-text-contrast"
                                      placeholder="min"
                                    />
                                    <span>min</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeManualActivity(
                                        dayIndex,
                                        sessionIndex
                                      )
                                    }
                                    className="ml-auto text-xs text-text-secondary hover:text-brand dark:text-dark-text-secondary"
                                  >
                                    ✕
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <select
                            className="flex-1 rounded-xl border border-border-base bg-bg-elevated px-3 py-2 text-sm text-text-primary dark:border-dark-border dark:bg-dark-bg dark:text-dark-text-contrast"
                            value={manualChoice[dayIndex] ?? ""}
                            onChange={(event) =>
                              handleManualChoice(dayIndex, event.target.value)
                            }
                          >
                            <option value="">Ajouter une activité...</option>
                            {ACTIVITIES.map((activity) => (
                              <option
                                key={`${dayIndex}-${activity.id}`}
                                value={activity.id}
                              >
                                {activity.icon} {activity.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min={10}
                            max={240}
                            className="w-32 rounded-xl border border-border-base bg-bg-elevated px-3 py-2 text-sm text-text-primary dark:border-dark-border dark:bg-dark-bg dark:text-dark-text-contrast"
                            placeholder="Durée (min)"
                            value={manualDurationChoice[dayIndex] ?? ""}
                            onChange={(event) =>
                              handleManualDuration(
                                dayIndex,
                                Number(event.target.value)
                              )
                            }
                          />
                          <button
                            type="button"
                            onClick={() => validateManualChoice(dayIndex)}
                            disabled={!manualChoice[dayIndex]}
                            className="btn-primary btn-compact disabled:opacity-50"
                          >
                            Ajouter
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {Object.keys(manualSchedule).length > 0 && (
                  <div className="mt-4 rounded-2xl border border-dashed border-border-base bg-bg-elevated p-4 dark:border-dark-border dark:bg-dark-muted">
                    <p className="text-xs uppercase tracking-[0.3em] text-text-secondary dark:text-dark-text-secondary">
                      Vue hebdomadaire
                    </p>
                    <div className="mt-3 flex gap-4 overflow-x-auto pb-1">
                      {selectedDays.map((dayIndex) => {
                        const selections = manualSchedule[dayIndex] || [];
                        const preview = selections.length ? selections : [null];
                        return (
                          <div
                            key={`preview-${dayIndex}`}
                            className="min-w-[140px] rounded-xl bg-bg-subtle p-3 dark:bg-dark-bg"
                          >
                            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary dark:text-dark-text-secondary">
                              {DAYS[dayIndex]}
                            </p>
                            <div className="mt-2 flex flex-col gap-2">
                              {preview.map((session, index) => {
                                if (!session) {
                                  return (
                                    <span
                                      key={`preview-${dayIndex}-empty-${index}`}
                                      className="rounded-lg border border-dashed border-border-base bg-transparent px-3 py-1 text-xs font-medium text-text-secondary dark:border-dark-border dark:text-dark-text-secondary"
                                    >
                                      Libre
                                    </span>
                                  );
                                }
                                const activity = ACTIVITIES.find(
                                  (a) => a.id === session.type
                                );
                                return (
                                  <span
                                    key={`preview-${dayIndex}-${session.type}-${index}`}
                                    className="inline-flex items-center gap-2 rounded-lg border border-border-base bg-bg-elevated px-3 py-1 text-xs font-semibold text-text-primary dark:border-dark-border dark:bg-dark-muted dark:text-dark-text-contrast"
                                  >
                                    <span>{activity?.icon || "🏋️"}</span>
                                    <span>
                                      {activity?.name || session.type}
                                      {session.duration
                                        ? ` · ${session.duration}min`
                                        : ""}
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSaveWeek}
                    className="btn-primary btn-compact btn-no-transform"
                  >
                    Enregistrer ma semaine
                  </button>
                  {savedWeek && (
                    <>
                      <button
                        type="button"
                        onClick={handleLoadSavedWeek}
                        className="btn-primary btn-compact btn-no-transform"
                      >
                        Appliquer la semaine enregistrée
                      </button>
                      <button
                        type="button"
                        onClick={handleClearSavedWeek}
                        className="rounded-2xl border border-transparent bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#7F1D1D] hover:underline dark:text-[#E67E80]"
                      >
                        Supprimer le plan enregistré
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {savedWeek && (
              <div className="mt-6 rounded-3xl border border-panel-border/60 bg-bg-elevated p-5 shadow-sm dark:border-[#1F3726] dark:bg-[#09140D]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-text-secondary dark:text-dark-text-secondary">
                      Aperçu enregistré
                    </p>
                    <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast">
                      Ma semaine sauvegardée
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold text-text-dark dark:text-[#E1F2E6]">
                    {savedWeekGoalMeta && (
                      <span className="inline-flex items-center gap-2 rounded-2xl border border-panel-border/50 bg-bg-elevated/80 px-3 py-1 dark:border-[#2C4735] dark:bg-[#102015]">
                        <span>{savedWeekGoalMeta.icon}</span>
                        <span>{savedWeekGoalMeta.name}</span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-2 rounded-2xl border border-panel-border/50 bg-bg-elevated/80 px-3 py-1 dark:border-[#2C4735] dark:bg-[#102015]">
                      <span>⏱️</span>
                      <span>
                        {savedWeekTotalDuration > 0
                          ? formatDuration(savedWeekTotalDuration)
                          : `${savedWeek.weeklyHours}h objectif`}
                      </span>
                    </span>
                    {activityDictionary[savedWeek.activityType] && (
                      <span className="inline-flex items-center gap-2 rounded-2xl border border-panel-border/50 bg-bg-elevated/80 px-3 py-1 dark:border-[#2C4735] dark:bg-[#102015]">
                        <span>
                          {activityDictionary[savedWeek.activityType].icon}
                        </span>
                        <span>
                          {activityDictionary[savedWeek.activityType].name}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <div className="min-w-full overflow-hidden rounded-2xl border border-panel-border/60 bg-bg-elevated dark:border-[#1F3726] dark:bg-[#0B140D]">
                    <table className="w-full border-collapse text-sm">
                      <thead className="bg-bg-default text-[#F1F5F9] dark:bg-[#0D1C12] dark:text-[#E6F6EB]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em]">
                            Jour
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em]">
                            Activités
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em]">
                            Durée
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em]">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {savedWeekRows.map((row, index) => {
                          const zebra =
                            index % 2 === 0
                              ? "bg-bg-elevated/80 dark:bg-[#0F1F16]"
                              : "bg-bg-elevated dark:bg-[#0B1811]";
                          const fallbackActivity =
                            activityDictionary[savedWeek.activityType];
                          return (
                            <tr
                              key={`saved-row-${row.dayIndex}`}
                              className={`${zebra} text-text-dark dark:text-dark-text-contrast`}
                            >
                              <td className="px-4 py-4 align-top">
                                <p className="text-sm font-semibold">
                                  {row.dayLabel}
                                </p>
                                <p className="text-xs text-text-secondary dark:text-[#A6C3AE]">
                                  {row.isSelected ? "Planifié" : "Libre"}
                                </p>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <div className="flex flex-wrap gap-2">
                                  {row.sessions.length > 0 ? (
                                    row.sessions.map(
                                      (session, sessionIndex) => (
                                        <span
                                          key={`saved-session-${row.dayIndex}-${sessionIndex}-${session.type}`}
                                          className={DEFAULT_BADGE_CLASSES}
                                        >
                                          <span>{session.icon}</span>
                                          <span>{session.displayName}</span>
                                        </span>
                                      )
                                    )
                                  ) : (
                                    <span
                                      className={`${DEFAULT_BADGE_CLASSES} ${
                                        row.isSelected
                                          ? ""
                                          : "italic text-text-secondary dark:text-[#A6C3AE]"
                                      }`}
                                    >
                                      <span>
                                        {row.isSelected
                                          ? fallbackActivity?.icon ?? "🗓️"
                                          : "🛌"}
                                      </span>
                                      <span>
                                        {row.isSelected
                                          ? `À planifier · ${
                                              fallbackActivity?.name ??
                                              savedWeek.activityType
                                            }`
                                          : "Repos"}
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4 align-top text-sm font-semibold">
                                {row.durationsLabel}
                              </td>
                              <td className="px-4 py-4 align-top text-xs text-text-secondary dark:text-dark-text-secondary">
                                {getSavedWeekRowNote(row)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleGeneratePlan}
              disabled={loading}
              className="btn-primary w-full text-sm tracking-wide disabled:opacity-60"
            >
              {loading ? "Génération..." : "Générer le plan"}
            </button>
          </section>

          <section className="space-y-6">
            {!plan.length && (
              <div className="rounded-3xl border border-dashed border-panel-border/70 bg-bg-elevated p-8 text-center dark:border-dark-border dark:bg-[#121919] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-[#1f2d1f]/40 dark:to-transparent pointer-events-none"></div>
                <p className="text-sm uppercase tracking-[0.4em] text-text-secondary dark:text-dark-text-secondary relative">
                  Préparez votre cycle
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-text-dark dark:text-dark-text-contrast relative">
                  Personnalisez puis lancez
                </h3>
                <p className="mt-2 text-sm text-text-secondary dark:text-dark-text-secondary relative">
                  Choisissez objectif, activité, volume et jours préférés pour
                  obtenir un plan nature-first de 4 semaines.
                </p>
                <div className="mt-6 grid gap-4 text-left md:grid-cols-3 relative">
                  {[
                    "Objectif & activité",
                    "Volume & répartition",
                    "Génération de la charge",
                  ].map((step, idx) => (
                    <div
                      key={step}
                      className="rounded-2xl border border-panel-border/60 bg-bg-elevated/80 p-4 shadow-sm dark:border-dark-border dark:bg-gradient-to-br dark:from-[#18211b] dark:via-[#1a2425] dark:to-[#11191c] dark:shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm"
                    >
                      <p className="text-sm font-semibold text-text-dark dark:text-dark-text-contrast">
                        Étape {idx + 1}
                      </p>
                      <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {savedPlansList.length > 0 && (
              <div className="rounded-3xl border border-panel-border/60 bg-bg-elevated p-5 dark:border-dark-border dark:bg-dark-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-text-secondary dark:text-dark-text-secondary">
                      Historique
                    </p>
                    <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-contrast">
                      Plans sauvegardés ({savedPlansList.length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSavedPlans(!showSavedPlans)}
                    className="btn-secondary btn-compact"
                  >
                    {showSavedPlans ? "Masquer" : "Voir"}
                  </button>
                </div>

                {showSavedPlans && (
                  <div className="mt-4 space-y-3">
                    {savedPlansList.map((savedPlan) => (
                      <div
                        key={savedPlan.id}
                        className={`flex items-center justify-between rounded-2xl border p-4 ${
                          savedPlan.isActive
                            ? "border-accent bg-bg-subtle"
                            : "border-border-base bg-bg-elevated dark:border-dark-border dark:bg-dark-bg"
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-text-primary dark:text-dark-text-contrast">
                            {savedPlan.name}
                            {savedPlan.isActive && (
                              <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs text-white">
                                Actif
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                            {GOALS.find((g) => g.id === savedPlan.goal)?.name ||
                              savedPlan.goal}{" "}
                            · {savedPlan.weeklyHours}h/sem ·{" "}
                            {savedPlan.mainActivityType}
                          </p>
                          <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                            {toLocaleDate(savedPlan.startDate)} →{" "}
                            {toLocaleDate(savedPlan.endDate)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => loadSpecificPlan(savedPlan.id)}
                            className="btn-primary btn-compact"
                          >
                            Charger
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSavedPlan(savedPlan.id)}
                            className="rounded-xl border border-danger bg-transparent px-3 py-1 text-xs font-semibold text-danger hover:bg-danger/10"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {plan.length > 0 && (
              <>
                <div className="rounded-3xl border border-panel-border/60 bg-bg-elevated p-5 dark:border-dark-border dark:bg-dark-card">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-text-secondary dark:text-dark-text-secondary">
                        {currentPlanName ? currentPlanName : "Découpage hebdo"}
                      </p>
                      <h3 className="text-xl font-semibold text-text-primary dark:text-dark-text-contrast">
                        Votre cycle sur 4 semaines
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {plan.map((week, index) => {
                        const focusToken = getFocusToken(week.focus);
                        const isActive = index === selectedWeek;
                        return (
                          <button
                            key={week.weekNumber}
                            type="button"
                            onClick={() => setSelectedWeek(index)}
                            className={`rounded-2xl border px-4 py-3 text-left transition ${
                              isActive
                                ? "border-accent bg-bg-subtle shadow-lg"
                                : "border-border-base bg-bg-elevated hover:border-accent/50 dark:border-dark-border dark:bg-dark-bg"
                            }`}
                          >
                            <p className="text-xs uppercase tracking-widest text-text-secondary dark:text-dark-text-secondary">
                              Semaine {week.weekNumber}
                            </p>
                            <p className="text-sm font-semibold text-text-primary dark:text-dark-text-contrast">
                              {focusToken.icon} {focusToken.label}
                            </p>
                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                              {toLocaleDate(week.startDate)} →{" "}
                              {toLocaleDate(week.endDate)}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {activeWeek && (
                  <div className="space-y-5">
                    <div className="rounded-3xl border border-panel-border/60 bg-bg-elevated p-6 dark:border-dark-border dark:bg-dark-card">
                      <div className="flex flex-wrap gap-6">
                        <div>
                          <p className="text-xs uppercase tracking-[0.4em] text-text-secondary dark:text-dark-text-secondary">
                            Fenêtre
                          </p>
                          <p className="text-lg font-semibold text-text-primary dark:text-dark-text-contrast">
                            {toLocaleDate(activeWeek.startDate)} ·{" "}
                            {toLocaleDate(activeWeek.endDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.4em] text-text-secondary dark:text-dark-text-secondary">
                            Charge
                          </p>
                          <p className="text-lg font-semibold text-text-primary dark:text-dark-text-contrast">
                            {activeWeek.totalLoad} TRIMP
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.4em] text-text-secondary dark:text-dark-text-secondary">
                            Sessions
                          </p>
                          <p className="text-lg font-semibold text-text-primary dark:text-dark-text-contrast">
                            {activeWeek.sessions.length}
                          </p>
                        </div>
                      </div>
                      {activeWeek.notes && (
                        <p className="mt-4 rounded-2xl bg-bg-subtle p-4 text-sm text-text-secondary dark:bg-dark-bg dark:text-dark-text-secondary">
                          {activeWeek.notes}
                        </p>
                      )}
                    </div>

                    <div className="rounded-3xl border border-panel-border/60 bg-bg-elevated p-6 dark:border-dark-border dark:bg-dark-card">
                      <p className="text-xs uppercase tracking-[0.35em] text-text-secondary dark:text-dark-text-secondary">
                        Sessions
                      </p>
                      <div className="mt-4 space-y-5">
                        {activeWeek.sessions.map((session, index) => {
                          const token = getIntensityToken(session.intensity);
                          const showConnector =
                            index < activeWeek.sessions.length - 1;
                          return (
                            <div
                              key={`${session.day}-${session.type}`}
                              className="flex gap-4"
                            >
                              <div className="flex flex-col items-center">
                                <span className="h-4 w-4 rounded-full border border-border-base bg-accent" />
                                {showConnector && (
                                  <span className="mt-1 w-[2px] flex-1 bg-border-base" />
                                )}
                              </div>
                              <div className="flex-1 rounded-2xl border border-panel-border/60 bg-bg-elevated p-5 shadow-sm dark:border-dark-border dark:bg-dark-bg">
                                <div className="flex flex-wrap items-center gap-3">
                                  <div>
                                    <p className="text-lg font-semibold text-text-primary dark:text-dark-text-contrast">
                                      {DAYS_FULL[session.dayOfWeek]}
                                    </p>
                                    <p className="text-xs uppercase tracking-widest text-text-secondary dark:text-dark-text-secondary">
                                      {toLocaleDate(session.day)}
                                    </p>
                                  </div>
                                  <span
                                    className={`ml-auto rounded-full border px-3 py-1 text-xs font-semibold bg-linear-to-br ${token.gradient} ${token.textClass} ${token.border}`}
                                  >
                                    {token.label}
                                  </span>
                                </div>

                                <p className="mt-3 text-base font-semibold text-text-primary dark:text-dark-text-contrast">
                                  {ACTIVITIES.find((a) => a.id === session.type)
                                    ?.icon || "🏋️"}{" "}
                                  {session.type}
                                </p>
                                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                                  {session.description}
                                </p>

                                <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                                  <div className="rounded-xl bg-bg-subtle p-3 text-center text-text-primary dark:bg-dark-muted dark:text-dark-text-secondary">
                                    <p className="text-xs uppercase tracking-widest">
                                      Durée
                                    </p>
                                    <p className="font-semibold">
                                      {formatDuration(session.duration)}
                                    </p>
                                  </div>
                                  <div className="rounded-xl bg-bg-subtle p-3 text-center text-text-primary dark:bg-dark-muted dark:text-dark-text-secondary">
                                    <p className="text-xs uppercase tracking-widest">
                                      TRIMP
                                    </p>
                                    <p className="font-semibold">
                                      {session.estimatedTrimp}
                                    </p>
                                  </div>
                                  <div className="rounded-xl bg-bg-subtle p-3 text-center text-text-primary dark:bg-dark-muted dark:text-dark-text-secondary">
                                    <p className="text-xs uppercase tracking-widest">
                                      Distance
                                    </p>
                                    <p className="font-semibold">
                                      {session.distance
                                        ? `${session.distance} km`
                                        : "Libre"}
                                    </p>
                                  </div>
                                  <div className="rounded-xl bg-bg-subtle p-3 text-center text-text-primary dark:bg-dark-muted dark:text-dark-text-secondary">
                                    <p className="text-xs uppercase tracking-widest">
                                      Zone FC
                                    </p>
                                    <p className="font-semibold">
                                      {session.targetHRZone
                                        ? `Z${session.targetHRZone}`
                                        : "Auto"}
                                    </p>
                                  </div>
                                </div>

                                <p className="mt-3 text-xs text-text-secondary dark:text-dark-text-secondary">
                                  {token.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-panel-border/60 bg-bg-elevated p-6 dark:border-dark-border dark:bg-dark-card">
                      <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-contrast">
                        Résumé du cycle
                      </h3>
                      <div className="mt-4 grid gap-4 md:grid-cols-4">
                        <div className="rounded-2xl bg-bg-subtle p-4 text-center dark:bg-dark-muted">
                          <p className="text-3xl font-bold text-text-primary">
                            {planStats.sessions}
                          </p>
                          <p className="text-xs uppercase tracking-widest text-text-secondary">
                            Sessions
                          </p>
                        </div>
                        <div className="rounded-2xl bg-bg-subtle p-4 text-center dark:bg-dark-muted">
                          <p className="text-3xl font-bold text-text-primary">
                            {planStats.hours}h
                          </p>
                          <p className="text-xs uppercase tracking-widest text-text-secondary">
                            Volume
                          </p>
                        </div>
                        <div className="rounded-2xl bg-bg-subtle p-4 text-center dark:bg-dark-muted">
                          <p className="text-3xl font-bold text-text-primary">
                            {planStats.load}
                          </p>
                          <p className="text-xs uppercase tracking-widest text-text-secondary">
                            TRIMP total
                          </p>
                        </div>
                        <div className="rounded-2xl bg-bg-subtle p-4 text-center dark:bg-dark-muted">
                          <p className="text-3xl font-bold text-text-primary">
                            {activeWeek.sessions.length
                              ? Math.round(
                                  activeWeek.totalLoad /
                                    activeWeek.sessions.length
                                )
                              : 0}
                          </p>
                          <p className="text-xs uppercase tracking-widest text-text-secondary">
                            TRIMP / séance
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
