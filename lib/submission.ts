/* Datensatz, der beim Absenden an den Webhook geht und als CSV-Zeile
   gespeichert wird. Wird im Browser (CSV-Download) und auf dem Server
   (api/submit) verwendet — daher keine Node-Importe hier. */

export type Teilnehmer = { firstName: string; lastName: string; programme: string; position: string };
export type GewaehltesAngebot = { measureNo: string; title: string; teachingUnits: number; dkz: string };

export type Submission = {
  submittedAt: string;
  language: "de" | "en";
  contact: {
    company: string;
    name: string;
    role: string;
    industry: string;
    email: string;
    phone: string;
    street: string;
    postcode: string;
    city: string;
  };
  priorExperience: string | null;
  companySize: string | null;
  courseFundingRate: number | null;
  wageSubsidyRate: number | null;
  requirements: { minHours20: boolean; qualification2Years: boolean; socialInsurance: boolean; met: number };
  employees: number | null;
  possibleVouchers: number | null;
  programmes: string[];
  offers: GewaehltesAngebot[];
  calculation: {
    courseCostPerParticipant: number;
    grossMonthlySalary: number;
    participants: number;
    durationMonths: number;
    trainingHoursPerMonth: number;
    regularHoursPerMonth: number;
    hourlyWage: number;
    wageCostTrainingHours: number;
    courseFundingPerParticipant: number;
    wageSubsidyPerParticipant: number;
    wageSubsidyPerMonth: number;
    wageSubsidyPerMonthTotal: number;
    ownContribution: number;
    totalFunding: number;
  } | null;
  plannedParticipants: number;
  participantList: Teilnehmer[];
  suggestedFollowUp: string;
};

/* Feste Spaltenreihenfolge — bleibt gleich, damit die CSV-Datei über
   alle Einsendungen hinweg dieselben Spalten hat. */
export const CSV_COLUMNS = [
  "submitted_at",
  "language",
  "company",
  "contact_name",
  "role",
  "industry",
  "email",
  "phone",
  "street",
  "postcode",
  "city",
  "prior_experience",
  "company_size",
  "course_funding_rate",
  "wage_subsidy_rate",
  "req_min_20h_per_week",
  "req_qualification_2_years",
  "req_social_insurance",
  "requirements_met",
  "employees",
  "possible_vouchers",
  "programmes",
  "offers",
  "course_cost_per_participant",
  "gross_monthly_salary",
  "participants_in_calculation",
  "duration_months",
  "training_hours_per_month",
  "regular_hours_per_month",
  "hourly_wage",
  "wage_cost_training_hours",
  "course_funding_per_participant",
  "wage_subsidy_per_participant",
  "wage_subsidy_per_month",
  "wage_subsidy_per_month_total",
  "own_contribution",
  "total_funding",
  "planned_participants",
  "participant_list",
  "suggested_follow_up",
] as const;

type Spalte = (typeof CSV_COLUMNS)[number];
type Wert = string | number | boolean | null | undefined;

const rund = (n: number) => Math.round(n * 100) / 100;

export function flatten(s: Submission): Record<Spalte, Wert> {
  const k = s.calculation;
  return {
    submitted_at: s.submittedAt,
    language: s.language,
    company: s.contact.company,
    contact_name: s.contact.name,
    role: s.contact.role,
    industry: s.contact.industry,
    email: s.contact.email,
    phone: s.contact.phone,
    street: s.contact.street,
    postcode: s.contact.postcode,
    city: s.contact.city,
    prior_experience: s.priorExperience,
    company_size: s.companySize,
    course_funding_rate: s.courseFundingRate,
    wage_subsidy_rate: s.wageSubsidyRate,
    req_min_20h_per_week: s.requirements.minHours20,
    req_qualification_2_years: s.requirements.qualification2Years,
    req_social_insurance: s.requirements.socialInsurance,
    requirements_met: s.requirements.met,
    employees: s.employees,
    possible_vouchers: s.possibleVouchers,
    programmes: s.programmes.join(" | "),
    offers: s.offers.map((a) => a.title + " (" + a.measureNo + ")").join(" | "),
    course_cost_per_participant: k?.courseCostPerParticipant,
    gross_monthly_salary: k?.grossMonthlySalary,
    participants_in_calculation: k?.participants,
    duration_months: k?.durationMonths,
    training_hours_per_month: k?.trainingHoursPerMonth,
    regular_hours_per_month: k?.regularHoursPerMonth,
    hourly_wage: k && rund(k.hourlyWage),
    wage_cost_training_hours: k && rund(k.wageCostTrainingHours),
    course_funding_per_participant: k && rund(k.courseFundingPerParticipant),
    wage_subsidy_per_participant: k && rund(k.wageSubsidyPerParticipant),
    wage_subsidy_per_month: k && rund(k.wageSubsidyPerMonth),
    wage_subsidy_per_month_total: k && rund(k.wageSubsidyPerMonthTotal),
    own_contribution: k && rund(k.ownContribution),
    total_funding: k && rund(k.totalFunding),
    planned_participants: s.plannedParticipants,
    participant_list: s.participantList
      .filter((t) => t.firstName || t.lastName || t.programme || t.position)
      .map((t) => [t.firstName, t.lastName].filter(Boolean).join(" ") + " (" + [t.programme, t.position].filter(Boolean).join(", ") + ")")
      .join(" | "),
    suggested_follow_up: s.suggestedFollowUp,
  };
}

/* CSV-Zelle: Anführungszeichen verdoppeln; Formel-Präfixe entschärfen,
   damit Excel eingegebene Texte nicht als Formel ausführt. */
function zelle(v: Wert): string {
  if (v === null || v === undefined) return "";
  let t = String(v);
  if (typeof v === "string" && /^[=+\-@\t\r]/.test(t)) t = "'" + t;
  return /[",\r\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
}

export const csvHeader = () => CSV_COLUMNS.join(",");
export const csvRow = (s: Submission) => {
  const f = flatten(s);
  return CSV_COLUMNS.map((c) => zelle(f[c])).join(",");
};

/* Einfache Plausibilitätsprüfung für den Server */
export function isSubmission(x: unknown): x is Submission {
  if (!x || typeof x !== "object") return false;
  const s = x as Partial<Submission>;
  return (
    (s.language === "de" || s.language === "en") &&
    typeof s.contact === "object" &&
    s.contact !== null &&
    typeof s.contact.company === "string" &&
    typeof s.contact.email === "string" &&
    Array.isArray(s.programmes) &&
    Array.isArray(s.offers) &&
    Array.isArray(s.participantList) &&
    typeof s.requirements === "object"
  );
}
