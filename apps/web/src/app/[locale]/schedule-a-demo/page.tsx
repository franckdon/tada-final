import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateMetadata } from "../metadata";
import { getI18n } from "@/locales/server";
import { DefaultTestimonial } from "@/components/testimonials";

export const metadata = generateMetadata({
  title: "Schedule a Demo | Tada",
  description:
    "Schedule a demo to see how Tada can help you get real-time, actionable insights for your organization.",
});

export default async function ScheduleDemoPage() {
  const t = await getI18n();
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-primary text-white py-16 md:py-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-rational-bold mb-6">
              {t("schedule_a_demo.title")}
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white">
              {t("schedule_a_demo.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-white">
        <div className="container-custom max-w-3xl">
          <div className="bg-gray-50 p-8 rounded-lg">
            <p className="text-2xl font-bold mb-8 text-center">
              {t("schedule_a_demo.form.request_a_demo")}
            </p>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first-name">
                    {t("schedule_a_demo.form.first_name")}*
                  </Label>
                  <Input id="first-name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">
                    {t("schedule_a_demo.form.last_name")}*
                  </Label>
                  <Input id="last-name" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="work-email">
                  {t("schedule_a_demo.form.work_email")}*
                </Label>
                <Input id="work-email" type="email" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">
                  {t("schedule_a_demo.form.company")}*
                </Label>
                <Input id="company" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-title">
                  {t("schedule_a_demo.form.job_title")}*
                </Label>
                <Input id="job-title" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("schedule_a_demo.form.phone")}</Label>
                <Input id="phone" type="tel" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">
                  {t("schedule_a_demo.form.industry")}*
                </Label>
                <select
                  id="industry"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-premise-blue"
                  required
                >
                  <option value="">
                    {t("schedule_a_demo.form.select_an_industry")}
                  </option>
                  <option value="Consumer Packaged Goods">
                    {t("schedule_a_demo.form.consumer_packaged_goods")}
                  </option>
                  <option value="Retail">
                    {t("schedule_a_demo.form.retail")}
                  </option>
                  <option value="Financial Services">
                    {t("schedule_a_demo.form.financial_services")}
                  </option>
                  <option value="Healthcare">
                    {t("schedule_a_demo.form.healthcare")}
                  </option>
                  <option value="Technology">
                    {t("schedule_a_demo.form.technology")}
                  </option>
                  <option value="International Development">
                    {t("schedule_a_demo.form.international_development")}
                  </option>
                  <option value="Government">
                    {t("schedule_a_demo.form.government")}
                  </option>
                  <option value="Non-profit">
                    {t("schedule_a_demo.form.non_profit")}
                  </option>
                  <option value="Other">
                    {t("schedule_a_demo.form.other")}
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">
                  {t("schedule_a_demo.form.country")}*
                </Label>
                <Input id="country" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">
                  {t("schedule_a_demo.form.how_can_tada_help_you")}
                </Label>
                <textarea
                  id="message"
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-premise-blue"
                />
              </div>

              <div className="flex items-start space-x-2">
                <input type="checkbox" id="consent" className="mt-1" required />
                <Label htmlFor="consent" className="text-sm">
                  {t(
                    "schedule_a_demo.form.i_consent_to_premise_processing_my_personal_data"
                  )}
                  <a
                    href="/privacy-policy"
                    className="text-premise-blue underline"
                  >
                    {t("schedule_a_demo.form.privacy_policy")}
                  </a>
                  .
                </Label>
              </div>

              <Button
                type="submit"
                className="bg-primary text-white py-2 px-6 w-full md:w-auto"
              >
                {t("schedule_a_demo.form.request_demo")}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <p className="text-2xl md:text-3xl font-bold mb-12 text-center">
            {t("schedule_a_demo.why_schedule_a_demo.title")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-premise-blue/10 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-premise-blue"
                  fill="purple"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold mb-2">
                {t(
                  "schedule_a_demo.why_schedule_a_demo.personalized_experience"
                )}
              </p>
              <p className="text-gray-600">
                {t(
                  "schedule_a_demo.why_schedule_a_demo.personalized_experience_description"
                )}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-premise-blue/10 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-premise-blue"
                  fill="blue"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold mb-2">
                {t("schedule_a_demo.why_schedule_a_demo.see_real_results")}
              </p>
              <p className="text-gray-600">
                {t(
                  "schedule_a_demo.why_schedule_a_demo.see_real_results_description"
                )}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-premise-blue/10 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-premise-blue"
                  fill="red"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold mb-2">
                {t("schedule_a_demo.why_schedule_a_demo.quick_implementation")}
              </p>
              <p className="text-gray-600">
                {t(
                  "schedule_a_demo.why_schedule_a_demo.quick_implementation_description"
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom ">
          <p className="text-2xl md:text-3xl font-bold  text-center mb-8">
            {t("home.testimonials.title")}
          </p>
          <DefaultTestimonial />
        </div>
      </section>
    </div>
  );
}
