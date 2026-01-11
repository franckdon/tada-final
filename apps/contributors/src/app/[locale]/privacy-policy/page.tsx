import { getI18n } from "@/locales/server";
import { generateMetadata } from "../../metadata";

export const metadata = generateMetadata({
  title: "Privacy Policy - TadaIQ",
  description:
    "This Privacy Policy explains how we collect, use, and share personal information when you use our services, and outlines your rights and choices.",
});

export default async function PrivacyPolicyPage() {
  const t = await getI18n();

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="prose prose-gray max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t("privacy.header.title")}
            </h1>
            <p className="text-lg text-gray-600">
              {t("privacy.header.effectiveDate")}
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <p className="text-lg leading-relaxed mb-4">
              {t("privacy.introduction.paragraph1")}
            </p>
            <p>{t("privacy.introduction.paragraph2")}</p>
            <p>{t("privacy.introduction.paragraph3")}</p>
            <p>{t("privacy.introduction.paragraph4")}</p>
          </section>

          {/* Your Role with Us */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t("privacy.roles.title")}
            </h2>
            <p className="mb-4">{t("privacy.roles.description")}</p>

            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-3">
                  {t("privacy.roles.customer.title")}
                </h3>
                <p className="text-blue-800">
                  {t("privacy.roles.customer.description")}
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-900 mb-3">
                  {t("privacy.roles.contributor.title")}
                </h3>
                <p className="text-green-800">
                  {t("privacy.roles.contributor.description")}
                </p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-purple-900 mb-3">
                  {t("privacy.roles.visitor.title")}
                </h3>
                <p className="text-purple-800">
                  {t("privacy.roles.visitor.description")}
                </p>
              </div>
            </div>

            <p className="mt-4">{t("privacy.roles.conclusion")}</p>
          </section>

          {/* Part I */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibent text-gray-900 mb-6">
              {t("privacy.partI.title")}
            </h2>
            <span className="text-gray-900">
              {t("privacy.partI.description")}
            </span>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t("privacy.partI.scope.title")}
            </h3>
            <p className="mb-4">{t("privacy.partI.scope.description")}</p>

            <div className="bg-yellow-50 p-6 rounded-lg mb-6">
              <h4 className="text-lg font-semibold text-yellow-900 mb-3">
                {t("privacy.partI.dataTransfers.title")}
              </h4>
              <p className="text-yellow-800">
                {t("privacy.partI.dataTransfers.description")}
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t("privacy.partI.ageRequirements.title")}
            </h3>
            <div className="bg-red-50 p-6 rounded-lg mb-6">
              <h4 className="text-lg font-semibold text-red-900 mb-3">
                {t("privacy.partI.ageRequirements.subtitle")}
              </h4>
              <p className="text-red-800 mb-3">
                {t("privacy.partI.ageRequirements.paragraph1")}
              </p>
              <p className="text-red-800">
                {t("privacy.partI.ageRequirements.paragraph2")}
              </p>
            </div>

            {/* Collection and Use of Information */}
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t("privacy.partI.collection.title")}
            </h3>
            <p className="mb-6">{t("privacy.partI.collection.description")}</p>

            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              {t("privacy.partI.collection.provided.title")}
            </h4>
            <span className="text-gray-900">
              {t("privacy.partI.collection.provided.description")}
            </span>

            <div className="space-y-4 mb-6">
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.collection.provided.account.title")}
                </h5>
                <p>
                  {t("privacy.partI.collection.provided.account.description")}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.collection.provided.profile.title")}
                </h5>
                <p>
                  {t("privacy.partI.collection.provided.profile.description")}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.collection.provided.tasks.title")}
                </h5>
                <p>
                  {t("privacy.partI.collection.provided.tasks.description")}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.collection.provided.payment.title")}
                </h5>
                <p>
                  {t("privacy.partI.collection.provided.payment.description")}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.collection.provided.communications.title")}
                </h5>
                <p>
                  {t(
                    "privacy.partI.collection.provided.communications.description"
                  )}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.collection.provided.contacts.title")}
                </h5>
                <p>
                  {t("privacy.partI.collection.provided.contacts.description")}
                </p>
              </div>
            </div>

            {/* Information We Collect Through Your Use of the Service */}
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              {t("privacy.partI.collection.automatic.title")}
            </h4>
            <span className="text-gray-900">
              {t("privacy.partI.collection.automatic.description")}
            </span>

            <div className="space-y-4 mb-6">
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.collection.automatic.location.title")}
                </h5>
                <p>
                  {t("privacy.partI.collection.automatic.location.description")}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.collection.automatic.device.title")}
                </h5>
                <p>
                  {t("privacy.partI.collection.automatic.device.description")}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.collection.automatic.sensor.title")}
                </h5>
                <p>
                  {t("privacy.partI.collection.automatic.sensor.description")}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.collection.automatic.logs.title")}
                </h5>
                <p>
                  {t("privacy.partI.collection.automatic.logs.description")}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.collection.automatic.cookies.title")}
                </h5>
                <p>
                  {t("privacy.partI.collection.automatic.cookies.description")}
                </p>
              </div>
            </div>

            {/* Information We Collect from Third Parties */}
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              {t("privacy.partI.collection.thirdParty.title")}
            </h4>
            <span className="text-gray-900">
              {t("privacy.partI.collection.thirdParty.description")}
            </span>

            <div className="space-y-4 mb-6">
              <div>
                <p>{t("privacy.partI.collection.thirdParty.socialLogin")}</p>
              </div>
              <div>
                <p>{t("privacy.partI.collection.thirdParty.analytics")}</p>
              </div>
              <div>
                <p>{t("privacy.partI.collection.thirdParty.mobile")}</p>
              </div>
              <div>
                <p>{t("privacy.partI.collection.thirdParty.verification")}</p>
              </div>
            </div>

            {/* Platform Permissions and Consent */}
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t("privacy.partI.permissions.title")}
            </h3>
            <div className="space-y-4 mb-6">
              <p>{t("privacy.partI.permissions.description")}</p>
            </div>

            {/* How We Use Your Information */}
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t("privacy.partI.howWeUse.title")}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.howWeUse.provide.title")}
                </h5>
                <p>{t("privacy.partI.howWeUse.provide.description")}</p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.howWeUse.improve.title")}
                </h5>
                <p>{t("privacy.partI.howWeUse.improve.description")}</p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.howWeUse.verify.title")}
                </h5>
                <p>{t("privacy.partI.howWeUse.verify.description")}</p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.howWeUse.communicate.title")}
                </h5>
                <p>{t("privacy.partI.howWeUse.communicate.description")}</p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.howWeUse.marketing.title")}
                </h5>
                <p>{t("privacy.partI.howWeUse.marketing.description")}</p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.howWeUse.personalize.title")}
                </h5>
                <p>{t("privacy.partI.howWeUse.personalize.description")}</p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.howWeUse.legal.title")}
                </h5>
                <p>{t("privacy.partI.howWeUse.legal.description")}</p>
              </div>
            </div>

            {/* Legal Bases for Processing */}
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t("privacy.partI.legalBases.title")}
            </h3>
            <div className="space-y-4 mb-6">
              <p>{t("privacy.partI.legalBases.description")}</p>
            </div>

            {/* Sharing of Information */}
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t("privacy.partI.sharing.title")}
            </h3>
            <span className="text-gray-900">
              {t("privacy.partI.sharing.description")}
            </span>

            <div className="space-y-4 mb-6">
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.sharing.clients.title")}
                </h5>
                <p>{t("privacy.partI.sharing.clients.description")}</p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.sharing.partners.title")}
                </h5>
                <p>{t("privacy.partI.sharing.partners.description")}</p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.sharing.serviceProviders.title")}
                </h5>
                <p>{t("privacy.partI.sharing.serviceProviders.description")}</p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.sharing.legal.title")}
                </h5>
                <p>{t("privacy.partI.sharing.legal.description")}</p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.sharing.businessTransfers.title")}
                </h5>
                <p>
                  {t("privacy.partI.sharing.businessTransfers.description")}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.sharing.consent.title")}
                </h5>
                <p>{t("privacy.partI.sharing.consent.description")}</p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.sharing.aggregated.title")}
                </h5>
                <p>{t("privacy.partI.sharing.aggregated.description")}</p>
              </div>
            </div>

            <p className="mt-4 mb-4 text-red-500">
              {t("privacy.partI.sharing.note")}
            </p>

            {/* Data Retention */}
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t("privacy.partI.retention.title")}
            </h3>
            <div className="space-y-4 mb-6">
              <p className="mb-6">{t("privacy.partI.retention.paragraph1")}</p>
              <p className="mb-6">{t("privacy.partI.retention.paragraph2")}</p>
              <p className="mb-6">{t("privacy.partI.retention.paragraph3")}</p>
            </div>

            {/* Data Security */}
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t("privacy.partI.security.title")}
            </h3>
            <div className="space-y-4 mb-6">
              <p className="mb-6">{t("privacy.partI.security.paragraph1")}</p>
              <p className="mb-6">{t("privacy.partI.security.paragraph2")}</p>
              <p className="mb-6">{t("privacy.partI.security.paragraph3")}</p>
            </div>

            {/* Your Choices and Rights */}
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t("privacy.partI.choices.title")}
            </h3>
            <span className="text-gray-900">
              {t("privacy.partI.choices.description")}
            </span>

            <div className="space-y-4 mb-6">
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.choices.access.title")}
                </h5>
                <p>{t("privacy.partI.choices.access.description")}</p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.choices.location.title")}
                </h5>
                <p>{t("privacy.partI.choices.location.description")}</p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.choices.cookies.title")}
                </h5>
                <p>{t("privacy.partI.choices.cookies.description")}</p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.choices.marketing.title")}
                </h5>
                <p>{t("privacy.partI.choices.marketing.description")}</p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.choices.doNotTrack.title")}
                </h5>
                <p>{t("privacy.partI.choices.doNotTrack.description")}</p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.partI.choices.other.title")}
                </h5>
                <p>{t("privacy.partI.choices.other.description")}</p>
              </div>
            </div>
          </section>

          {/* European Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t("privacy.europeanRights.title")}
            </h2>
            <p className="mb-4">{t("privacy.europeanRights.description")}</p>

            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>
                <strong>{t("privacy.europeanRights.right1.title")} </strong>
                {t("privacy.europeanRights.right1.description")}
              </li>
              <li>
                <strong>{t("privacy.europeanRights.right2.title")} </strong>
                {t("privacy.europeanRights.right2.description")}
              </li>
              <li>
                <strong>{t("privacy.europeanRights.right3.title")} </strong>
                {t("privacy.europeanRights.right3.description")}
              </li>
              <li>
                <strong>{t("privacy.europeanRights.right4.title")} </strong>
                {t("privacy.europeanRights.right4.description")}
              </li>
              <li>
                <strong>{t("privacy.europeanRights.right5.title")} </strong>
                {t("privacy.europeanRights.right5.description")}
              </li>
              <li>
                <strong>{t("privacy.europeanRights.right6.title")} </strong>
                {t("privacy.europeanRights.right6.description")}
              </li>
              <li>
                <strong>{t("privacy.europeanRights.right7.title")} </strong>
                {t("privacy.europeanRights.right7.description")}
              </li>
            </ul>

            <p className="mt-4 mb-4">
              {t("privacy.europeanRights.exercising")}
            </p>
          </section>

          {/* Part II - Customers */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t("privacy.partII.title")}
            </h2>
            <p className="mb-4">{t("privacy.partII.description")}</p>

            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>
                <strong>{t("privacy.partII.clientAccount.title")}</strong>{" "}
                {t("privacy.partII.clientAccount.description")}
              </li>
              <li>
                <strong>
                  {t("privacy.partII.clientCommunications.title")}
                </strong>{" "}
                {t("privacy.partII.clientCommunications.description")}
              </li>
              <li>
                <strong>{t("privacy.partII.thirdPartyTools.title")}</strong>{" "}
                {t("privacy.partII.thirdPartyTools.description")}
              </li>
              <li>
                <strong>{t("privacy.partII.salesCrm.title")}</strong>{" "}
                {t("privacy.partII.salesCrm.description")}
              </li>
              <li>
                <strong>{t("privacy.partII.conflicts.title")}</strong>{" "}
                {t("privacy.partII.conflicts.description")}
              </li>
            </ul>
          </section>

          {/* Part III - Contributors */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t("privacy.partIII.title")}
            </h2>
            <p className="mb-4">{t("privacy.partIII.description")}</p>

            <p className="mb-4 text-amber-800">
              {t("privacy.partIII.additionalNotices")}
            </p>

            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              {t("privacy.partIII.dataCategories.title")}
            </h4>

            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>
                <strong>
                  {t("privacy.partIII.dataCategories.identifiers.title")}
                </strong>{" "}
                {t("privacy.partIII.dataCategories.identifiers.description")}
              </li>
              <li>
                <strong>
                  {t("privacy.partIII.dataCategories.location.title")}
                </strong>{" "}
                {t("privacy.partIII.dataCategories.location.description")}
              </li>
              <li>
                <strong>
                  {t("privacy.partIII.dataCategories.userContent.title")}
                </strong>{" "}
                {t("privacy.partIII.dataCategories.userContent.description")}
              </li>
              <li>
                <strong>
                  {t("privacy.partIII.dataCategories.device.title")}
                </strong>{" "}
                {t("privacy.partIII.dataCategories.device.description")}
              </li>
              <li>
                <strong>
                  {t("privacy.partIII.dataCategories.usage.title")}
                </strong>{" "}
                {t("privacy.partIII.dataCategories.usage.description")}
              </li>
              <li>
                <strong>
                  {t("privacy.partIII.dataCategories.language.title")}
                </strong>{" "}
                {t("privacy.partIII.dataCategories.language.description")}
              </li>
              <li>
                <strong>
                  {t("privacy.partIII.dataCategories.contacts.title")}
                </strong>{" "}
                {t("privacy.partIII.dataCategories.contacts.description")}
              </li>
              <li>
                <strong>
                  {t("privacy.partIII.dataCategories.payment.title")}
                </strong>{" "}
                {t("privacy.partIII.dataCategories.payment.description")}
              </li>
            </ul>

            <p className="mb-4">{t("privacy.partIII.summary")}</p>
            <p className="mb-4">{t("privacy.partIII.publicDisclosure")}</p>
          </section>

          {/* Part IV - California Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t("privacy.partIV.title")}
            </h2>
            <p className="mb-4">{t("privacy.partIV.description")}</p>

            <h4>{t("privacy.partIV.categories.title")}</h4>
            <p className="mb-4">{t("privacy.partIV.categories.description")}</p>

            <h4>{t("privacy.partIV.disclosure.title")}</h4>
            <p className="mb-4">{t("privacy.partIV.disclosure.description")}</p>

            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>
                <strong>{t("privacy.partIV.right1.title")} </strong>
                {t("privacy.partIV.right1.description")}
              </li>
              <li>
                <strong>{t("privacy.partIV.right2.title")} </strong>
                {t("privacy.partIV.right2.description")}
              </li>
              <li>
                <strong>{t("privacy.partIV.right3.title")} </strong>
                {t("privacy.partIV.right3.description")}
              </li>
              <li>
                <strong>{t("privacy.partIV.right4.title")} </strong>
                {t("privacy.partIV.right4.description")}
              </li>
              <li>
                <strong>{t("privacy.partIV.right5.title")} </strong>
                {t("privacy.partIV.right5.description")}
              </li>
              <li>
                <strong>{t("privacy.partIV.right6.title")} </strong>
                {t("privacy.partIV.right6.description")}
              </li>
            </ul>

            <h4>{t("privacy.partIV.exercising.title")}</h4>
            <p className="mb-4">{t("privacy.partIV.exercising.description")}</p>

            <p className="mb-4">{t("privacy.partIV.response")}</p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t("privacy.contact.title")}
            </h2>
            <p className="mb-4">{t("privacy.contact.description")}</p>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.contact.email.title")}
                </h4>
                <p className="text-gray-700">
                  <a
                    href="mailto:privacy@tadaiq.com"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    privacy@tadaiq.com
                  </a>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {t("privacy.contact.email.note")}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {t("privacy.contact.mail.title")}
                </h4>
                <address className="text-gray-700 not-italic">
                  {t("privacy.contact.mail.address.line1")}
                  <br />
                  {t("privacy.contact.mail.address.line2")}
                  <br />
                  {t("privacy.contact.mail.address.line3")}
                </address>
                <p className="text-sm text-gray-600 mt-1">
                  {t("privacy.contact.mail.note")}
                </p>
              </div>
            </div>
          </section>

          {/* Footer Note */}
          <section className="text-center py-8 border-t">
            <p className="text-gray-600">{t("privacy.footer.paragraph1")}</p>
            <p className="text-gray-600">{t("privacy.footer.paragraph2")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
