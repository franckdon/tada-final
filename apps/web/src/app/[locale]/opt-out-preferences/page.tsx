import { getI18n } from "@/locales/server";
import { generateMetadata } from "../metadata";

export const metadata = generateMetadata({
  title: "Opt Out Preferences - TadaIQ",
  description:
    "Manage your preferences for how we use your data and opt out of certain types of data collection.",
});

export default async function OptOutPreferencesPage() {
  const t = await getI18n();
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="prose prose-gray max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t("cookie_policy.title")}
            </h1>
            <p className="text-lg text-gray-600">
              {t("cookie_policy.effective_date")}
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t("cookie_policy.section_1_title")}
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              {t("cookie_policy.section_1_content_1")}
            </p>
            <p className="mb-4">{t("cookie_policy.section_1_content_2")}</p>
            <p>{t("cookie_policy.section_1_content_3")}</p>
          </section>

          {/* What Are Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t("cookie_policy.section_2_title")}
            </h2>
            <p className="mb-4">{t("cookie_policy.section_2_content_1")}</p>
            <p>{t("cookie_policy.section_2_content_2")}</p>
          </section>

          {/* Why We Use Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t("cookie_policy.section_3_title")}
            </h2>
            <p className="mb-4">{t("cookie_policy.section_3_intro")}</p>

            <ul className="space-y-3 mb-6 list-disc pl-6">
              <li className="text-gray-700">
                <strong>{t("cookie_policy.section_3_item_1")}</strong>
              </li>
              <li className="text-gray-700">
                <strong>{t("cookie_policy.section_3_item_2")}</strong>
              </li>
              <li className="text-gray-700">
                <strong>{t("cookie_policy.section_3_item_3")}</strong>
              </li>
              <li className="text-gray-700">
                <strong>{t("cookie_policy.section_3_item_4")}</strong>
              </li>
              <li className="text-gray-700">
                <strong>{t("cookie_policy.section_3_item_5")}</strong>
              </li>
            </ul>

            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-blue-800">
                {t("cookie_policy.section_3_note")}
              </p>
            </div>
          </section>

          {/* Types of Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t("cookie_policy.section_4_title")}
            </h2>

            <div className="space-y-6">
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-red-900 mb-3">
                  {t("cookie_policy.strictly_necessary_title")}
                </h3>
                <p className="text-red-800">
                  {t("cookie_policy.strictly_necessary_content")}
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-900 mb-3">
                  {t("cookie_policy.preference_title")}
                </h3>
                <p className="text-green-800">
                  {t("cookie_policy.preference_content")}
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-3">
                  {t("cookie_policy.analytics_title")}
                </h3>
                <p className="text-blue-800">
                  {t("cookie_policy.analytics_content")}
                </p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-purple-900 mb-3">
                  {t("cookie_policy.marketing_title")}
                </h3>
                <p className="text-purple-800">
                  {t("cookie_policy.marketing_content")}
                </p>
              </div>
            </div>
          </section>

          {/* Cookie Choices */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t("cookie_policy.section_5_title")}
            </h2>
            <p className="mb-4">{t("cookie_policy.section_5_content_1")}</p>
            <p className="mb-4">{t("cookie_policy.section_5_content_2")}</p>

            <div className="bg-yellow-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-yellow-900 mb-3">
                {t("cookie_policy.section_5_notice_title")}
              </h4>
              <p className="text-yellow-800">
                {t("cookie_policy.section_5_notice_content")}
              </p>
            </div>
          </section>

          {/* Privacy Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t("cookie_policy.section_6_title")}
            </h2>
            <p className="mb-4">{t("cookie_policy.section_6_content_1")}</p>
            <p>
              {t("cookie_policy.section_6_content_2")}
              <a
                href="mailto:privacy@tadaiq.com"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {t("cookie_policy.contact_email")}
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
