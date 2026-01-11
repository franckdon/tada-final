import { generateMetadata } from "../metadata";
import { getI18n } from "@/locales/server";
import {
  FileText,
  Users,
  Shield,
  Scale,
  AlertTriangle,
  Gavel,
  UserCheck,
  CreditCard,
  Lock,
  Globe,
} from "lucide-react";

export const metadata = generateMetadata({
  title: "Terms of Use - TadaIQ",
  description:
    "Read TadaIQ's Terms of Use governing your access to and use of our data intelligence platform across Francophone Africa.",
});

export default async function TermsOfUse() {
  const t = await getI18n();

  return (
    <div className="flex flex-col px-4 sm:px-6 lg:px-16">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t("terms_of_use.title")}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              <strong>{t("terms_of_use.effective_date")}:</strong> May 31, 2025
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
              <p className="text-gray-700 leading-relaxed">
                {t("terms_of_use.welcome_to_tadaiq")}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {t("terms_of_use.please_read_these_terms_carefully")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {t("terms_of_use.quick_navigation")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Users,
                title: t("terms_of_use.definitions"),
                href: "#definitions",
              },
              {
                icon: UserCheck,
                title: t("terms_of_use.acceptance"),
                href: "#acceptance",
              },
              {
                icon: UserCheck,
                title: t("terms_of_use.eligibility"),
                href: "#eligibility",
              },
              {
                icon: Shield,
                title: t("terms_of_use.account_security"),
                href: "#account",
              },
              {
                icon: Globe,
                title: t("terms_of_use.services"),
                href: "#services",
              },
              {
                icon: UserCheck,
                title: t("terms_of_use.contributor_obligations"),
                href: "#contributor-obligations",
              },
              {
                icon: UserCheck,
                title: t("terms_of_use.client_obligations"),
                href: "#client-obligations",
              },
              {
                icon: UserCheck,
                title: t("terms_of_use.intellectual_property"),
                href: "#intellectual-property",
              },
              {
                icon: CreditCard,
                title: t("terms_of_use.payments"),
                href: "#payments",
              },
              {
                icon: Lock,
                title: t("terms_of_use.privacy"),
                href: "#privacy",
              },
              {
                icon: AlertTriangle,
                title: t("terms_of_use.disclaimers"),
                href: "#disclaimers",
              },
              {
                icon: Scale,
                title: t("terms_of_use.liability"),
                href: "#liability",
              },
              {
                icon: Scale,
                title: t("terms_of_use.indemnification"),
                href: "#indemnification",
              },
              {
                icon: Scale,
                title: t("terms_of_use.suspension_termination_cancellation"),
                href: "#suspension",
              },
              {
                icon: Gavel,
                title: t("terms_of_use.general"),
                href: "#general",
              },
            ].map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <item.icon className="w-5 h-5 text-primary mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-900">{item.title}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto prose prose-lg prose-blue max-w-none">
          {/* Section 1: Definitions */}
          <div id="definitions" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Users className="w-8 h-8 text-primary mr-3" />
              {t("terms_of_use.section_1_title")}
            </h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("terms_of_use.tadaiq_definition_title")}
                </h3>
                <p className="text-gray-700">
                  {t("terms_of_use.tadaiq_definition_content")}
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("terms_of_use.platform_definition_title")}
                </h3>
                <p className="text-gray-700">
                  {t("terms_of_use.platform_definition_content")}
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("terms_of_use.contributor_definition_title")}
                </h3>
                <p className="text-gray-700">
                  {t("terms_of_use.contributor_definition_content")}
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("terms_of_use.client_definition_title")}
                </h3>
                <p className="text-gray-700">
                  {t("terms_of_use.client_definition_content")}
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("terms_of_use.user_definition_title")}
                </h3>
                <p className="text-gray-700">
                  {t("terms_of_use.user_definition_content")}
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("terms_of_use.tasks_definition_title")}
                </h3>
                <p className="text-gray-700">
                  {t("terms_of_use.tasks_definition_content")}
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("terms_of_use.submission_definition_title")}
                </h3>
                <p className="text-gray-700">
                  {t("terms_of_use.submission_definition_content")}
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("terms_of_use.client_data_definition_title")}
                </h3>
                <p className="text-gray-700">
                  {t("terms_of_use.client_data_definition_content")}
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("terms_of_use.personal_data_definition_title")}
                </h3>
                <p className="text-gray-700">
                  {t("terms_of_use.personal_data_definition_content")}
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("terms_of_use.privacy_policy_definition_title")}
                </h3>
                <p className="text-gray-700">
                  {t("terms_of_use.privacy_policy_definition_content")}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Acceptance of Terms */}
          <div className="mb-16" id="acceptance">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t("terms_of_use.section_2_title")}
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-700">
                    {t("terms_of_use.acceptance_content")}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {t("terms_of_use.acceptance_compliance")}
            </p>
          </div>

          {/* Section 3: Eligibility */}
          <div id="eligibility" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <UserCheck className="w-8 h-8 text-primary mr-3" />
              {t("terms_of_use.section_3_title")}
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_3_1_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_3_1_content")}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_3_2_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_3_2_content")}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_3_3_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_3_3_content")}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Account Registration and Security */}
          <div id="account" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Shield className="w-8 h-8 text-primary mr-3" />
              {t("terms_of_use.section_4_title")}
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_4_1_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t("terms_of_use.section_4_1_content")}
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_4_2_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_4_2_content")}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_4_3_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_4_3_content")}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_4_4_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_4_4_content")}
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Description of Services */}
          <div id="services" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Globe className="w-8 h-8 text-primary mr-3" />
              {t("terms_of_use.section_5_title")}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {t("terms_of_use.section_5_1_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t("terms_of_use.section_5_1_content")}
                </p>
                <div className="bg-blue-100 p-4 rounded border">
                  <p className="text-sm text-gray-700">
                    <strong>Important:</strong>{" "}
                    {t("terms_of_use.section_5_1_important")}
                  </p>
                </div>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {t("terms_of_use.section_5_2_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t("terms_of_use.section_5_2_content")}
                </p>
                <div className="bg-purple-100 p-4 rounded border">
                  <p className="text-sm text-gray-700">
                    <strong>Important:</strong>{" "}
                    {t("terms_of_use.section_5_2_important")}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg mt-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t("terms_of_use.section_5_3_title")}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t("terms_of_use.section_5_3_content")}
              </p>
            </div>
          </div>

          {/* Section 6: Contributor Obligations */}
          <div className="mb-16" id="contributor-obligations">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t("terms_of_use.section_6_title")}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              {t("terms_of_use.section_6_intro")}
            </p>
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_6_1_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_6_1_content")}
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_6_2_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_6_2_content")}
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_6_3_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t("terms_of_use.section_6_3_content")}
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_6_4_title")}
                </h3>
                <div className="flex items-start">
                  <AlertTriangle className="w-6 h-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {t("terms_of_use.section_6_4_content_1")}
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      {t("terms_of_use.section_6_4_content_2")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_6_5_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_6_5_content")}
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_6_6_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_6_6_content")}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_6_7_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_6_7_content")}
                </p>
              </div>
              <div className="bg-red-100 border border-red-300 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_6_8_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t("terms_of_use.section_6_8_intro")}
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>{t("terms_of_use.section_6_8_item_1")}</li>
                  <li>{t("terms_of_use.section_6_8_item_2")}</li>
                  <li>{t("terms_of_use.section_6_8_item_3")}</li>
                  <li>{t("terms_of_use.section_6_8_item_4")}</li>
                  <li>{t("terms_of_use.section_6_8_item_5")}</li>
                  <li>{t("terms_of_use.section_6_8_item_6")}</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  {t("terms_of_use.section_6_8_consequence")}
                </p>
              </div>
            </div>
          </div>

          {/* Section 7: Client Obligations */}
          <div className="mb-16" id="client-obligations">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t("terms_of_use.section_7_title")}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              {t("terms_of_use.section_7_intro")}
            </p>
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_7_1_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_7_1_content")}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_7_2_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_7_2_content")}
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_7_3_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_7_3_content")}
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_7_4_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_7_4_content")}
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_7_5_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_7_5_content")}
                </p>
              </div>
            </div>
            <div className="bg-red-100 border border-red-300 rounded-lg p-6 mt-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("terms_of_use.section_7_6_title")}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t("terms_of_use.section_7_6_intro")}
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>{t("terms_of_use.section_7_6_item_1")}</li>
                <li>{t("terms_of_use.section_7_6_item_2")}</li>
                <li>{t("terms_of_use.section_7_6_item_3")}</li>
                <li>{t("terms_of_use.section_7_6_item_4")}</li>
                <li>{t("terms_of_use.section_7_6_item_5")}</li>
              </ul>
            </div>
          </div>

          {/* Section 8: Intellectual Property */}
          <div className="mb-16" id="intellectual-property">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t("terms_of_use.section_8_title")}
            </h2>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_8_1_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_8_1_content")}
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_8_2_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t("terms_of_use.section_8_2_content_1")}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_8_2_content_2")}
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_8_3_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_8_3_content")}
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_8_4_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_8_4_content")}
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_8_5_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_8_5_content")}
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_8_6_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_8_6_content")}
                </p>
              </div>
            </div>
          </div>

          {/* Section 9: Payments */}
          <div id="payments" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <CreditCard className="w-8 h-8 text-primary mr-3" />
              {t("terms_of_use.section_9_title")}
            </h2>
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_9_1_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t("terms_of_use.section_9_1_content_1")}
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t("terms_of_use.section_9_1_content_2")}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_9_1_content_3")}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_9_1_content_4")}
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_9_2_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t("terms_of_use.section_9_2_content_1")}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_9_2_content_2")}
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_9_3_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_9_3_content")}
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_9_4_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t("terms_of_use.section_9_4_content_1")}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_9_4_content_2")}
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_9_5_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_9_5_content")}
                </p>
              </div>
            </div>
          </div>

          {/* Section 10: Privacy */}
          <div id="privacy" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Lock className="w-8 h-8 text-primary mr-3" />
              {t("terms_of_use.section_10_title")}
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <p className="text-gray-700 leading-relaxed">
                {t("terms_of_use.section_10_intro")}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("terms_of_use.section_10_compliance_title")}
                </h3>
                <p className="text-gray-700">
                  {t("terms_of_use.section_10_compliance_content")}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("terms_of_use.section_10_contributors_title")}
                </h3>
                <p className="text-gray-700">
                  {t("terms_of_use.section_10_contributors_content")}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("terms_of_use.section_10_clients_title")}
                </h3>
                <p className="text-gray-700">
                  {t("terms_of_use.section_10_clients_content")}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("terms_of_use.section_10_rights_title")}
                </h3>
                <p className="text-gray-700">
                  {t("terms_of_use.section_10_rights_content")}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("terms_of_use.section_10_security_title")}
                </h3>
                <p className="text-gray-700">
                  {t("terms_of_use.section_10_security_content")}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("terms_of_use.section_10_transfers_title")}
                </h3>
                <p className="text-gray-700">
                  {t("terms_of_use.section_10_transfers_content")}
                </p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              {t("terms_of_use.section_10_conclusion")}
            </p>
          </div>

          {/* Section 11: Disclaimers */}
          <div id="disclaimers" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <AlertTriangle className="w-8 h-8 text-orange-500 mr-3" />
              {t("terms_of_use.section_11_title")}
            </h2>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("terms_of_use.section_11_risk_title")}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t("terms_of_use.section_11_risk_content")}
              </p>
              <div className="space-y-4 mb-4">
                <div>
                  <p className="text-gray-700">
                    {t("terms_of_use.section_11_disclaimer_1")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    {t("terms_of_use.section_11_disclaimer_2")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    {t("terms_of_use.section_11_disclaimer_3")}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("terms_of_use.section_11_employment_title")}
                </h3>
                <p className="text-gray-700">
                  {t("terms_of_use.section_11_employment_content")}
                </p>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("terms_of_use.section_11_third_party_title")}
                </h3>
                <p className="text-gray-700">
                  {t("terms_of_use.section_11_third_party_content")}
                </p>
              </div>
              <div className="mt-4">
                <p className="text-gray-700">
                  {t("terms_of_use.section_11_jurisdiction_note")}
                </p>
              </div>
            </div>
          </div>

          {/* Section 12: Limitation of Liability */}
          <div id="liability" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Scale className="w-8 h-8 text-primary mr-3" />
              {t("terms_of_use.section_12_title")}
            </h2>
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_12_1_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_12_1_content")}
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_12_2_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_12_2_content")}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_12_3_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_12_3_content")}
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_12_4_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_12_4_content")}
                </p>
              </div>
            </div>
          </div>

          {/* Section 13: Indemnification */}
          <div id="indemnification" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Scale className="w-8 h-8 text-primary mr-3" />
              {t("terms_of_use.section_13_title")}
            </h2>
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_13_content_1")}
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  {t("terms_of_use.section_13_content_2")}
                </p>
              </div>
            </div>
          </div>

          {/* Section 14: Suspension, Termination, and Cancellation */}
          <div id="suspension" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Scale className="w-8 h-8 text-primary mr-3" />
              {t("terms_of_use.section_14_title")}
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_14_1_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_14_1_content")}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_14_2_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_14_2_content")}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_14_3_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t("terms_of_use.section_14_3_content_1")}
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  {t("terms_of_use.section_14_3_content_2")}
                </p>
              </div>
            </div>
          </div>

          {/* Section 15: General Provisions */}
          <div id="general" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Gavel className="w-8 h-8 text-primary mr-3" />
              {t("terms_of_use.section_15_title")}
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_15_1_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_15_1_content")}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_15_2_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_15_2_content")}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_15_3_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_15_3_content")}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_15_4_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_15_4_content")}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_15_5_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_15_5_content")}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_15_6_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_15_6_content")}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_15_7_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_15_7_content")}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_15_8_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_15_8_content")}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_15_9_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_15_9_content")}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_15_10_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("terms_of_use.section_15_10_content")}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("terms_of_use.section_15_11_title")}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t("terms_of_use.section_15_11_content")}
                </p>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>{t("terms_of_use.section_15_11_company")}</strong>
                  </p>
                  <p>{t("terms_of_use.section_15_11_email")}</p>
                  <p>{t("terms_of_use.section_15_11_address")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Final Statement */}
          <div className="bg-gradient-to-r from-primary to-purple-600 text-white p-8 rounded-2xl text-center">
            <h3 className="text-2xl font-bold mb-4">
              {t("terms_of_use.final_message_title")}
            </h3>
            <p className="text-lg opacity-90 leading-relaxed">
              {t("terms_of_use.final_message_content")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
