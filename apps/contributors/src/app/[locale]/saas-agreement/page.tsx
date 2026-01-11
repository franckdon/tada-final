import { getI18n } from "@/locales/server";
import { generateMetadata } from "../../metadata";
import RightMenu from "@/components/AnnexeRightMenu";

export const metadata = generateMetadata({
  title: "SaaS Agreement - TadaIQ",
  description:
    "This Privacy Policy explains how we collect, use, and share personal information when you use our services, and outlines your rights and choices.",
});

export default async function PrivacyPolicyPage() {
  const t = await getI18n();

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom grid grid-cols-4">
        <div className="col-span-4 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              SaaS Agreement
            </h1>
            <p className="text-lg text-gray-600">
              Effective Date: May 31, 2025
            </p>
          </div>
        </div>
        {/* Mobile version: placed before content, horizontal, sticky */}
        <div className="col-span-4 lg:hidden sticky top-0 z-30 bg-white shadow-sm px-4 py-3 overflow-x-auto">
          <ul className="flex gap-4 text-sm whitespace-nowrap">
            <li className="px-3 py-2 rounded hover:bg-gray-100 border-b-2 border-primary">
              <a href="/privacy">Privacy Policy</a>
            </li>
            <li className="px-3 py-2 rounded hover:bg-gray-100">
              <a href="/community-guidelines">Community Guidelines</a>
            </li>
            <li className="px-3 py-2 rounded hover:bg-gray-100">
              <a href="/terms-of-use">Mobile Terms of Use</a>
            </li>
            <li className="px-3 py-2 rounded hover:bg-gray-100">
              <a href="/saas-agreement">SaaS Agreement</a>
            </li>
            <li className="px-3 py-2 rounded hover:bg-gray-100">
              <a href="/modern-slavery-statement">Modern Slavery Statement</a>
            </li>
          </ul>
        </div>

        <div className="col-span-3">
          <div className="prose prose-gray max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700">
            {/* Introduction */}
            <section className="mb-8">
              <p className="text-lg leading-relaxed mb-4">
                This Software-as-a-Service Agreement (“Agreement”) is a binding contract between you and the organization you represent (collectively, “Customer”) and TadaIQ (“TadaIQ” or “we”). TadaIQ is a data collection and AI-powered market intelligence platform targeting businesses, non-governmental organizations (NGOs), and public institutions in Francophone Africa. By accessing or using the TadaIQ-hosted solution or services, Customer agrees to all terms and conditions in this Agreement. This Agreement is effective as of the date Customer agrees to it (such as by signing an order form or electronically accepting these terms) (“Effective Date”). If TadaIQ and Customer have signed a separate master services agreement covering the services, that separate agreement will prevail, and this Agreement will not apply.
              </p>
            </section>

            {/* Part I */}
            <section className="mb-8 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                1. TADAIQ SERVICES
              </h2>
              <h3 className="text-xl font-semibold text-gray-900">
                1.1 Access Rights
              </h3>

              <p className="mt-4">
                During the term of an applicable order form, statement of work, or similar document agreed by the parties that references this Agreement (an “Order Document”), Customer is granted a limited, non-exclusive right to access and use, on a software-as-a-service basis, TadaIQ’s online platform and services (the “TadaIQ Services”) for Customer’s internal business purposes, by this Agreement and any documentation or usage instructions provided by TadaIQ (“Documentation”). The TadaIQ Services enable customers to launch custom data collection missions via mobile contributors, access curated dashboards of market insights, and utilize AI-powered analytics and report generation. For clarity, TadaIQ provides a hosted solution – no source code or software copy of the TadaIQ platform is provided to the Customer. Suppose TadaIQ provides any downloadable software components (for example, a mobile or desktop client application) to facilitate use of the SaaS platform. In that case, TadaIQ grants Customer a limited, non-exclusive, non-transferable, non-sublicensable license to use such software in object code form only and solely for accessing and using the TadaIQ Services as permitted herein. Use of the TadaIQ Services is limited to Customer’s authorized users as specified in the applicable Order Document or as enabled in Customer’s account (“Permitted Users”). Customer is responsible for maintaining the confidentiality of user login credentials (such as user IDs and passwords) and for all activities that occur under Customer’s accounts. Customer will promptly notify TadaIQ of any unauthorized use of the TadaIQ Services or any breach of security relating to Customer’s accounts.
              </p>

              <h3 className="text-xl font-semibold text-gray-900">
                1.2 Contractors and Affiliates as Users
              </h3>
              <p className="mb-4">
                Customer may allow its contractors, consultants, or affiliates (collectively, “Contractors”) to use the TadaIQ Services as Permitted Users, provided that: (a) such Contractors are not competitors of TadaIQ; (b) use by all Permitted Users (including Contractors) remains within any usage limits or restrictions set in the Order Document; and (c) Customer ensures each such Contractor complies with the terms of this Agreement. Customer is liable for any use or misuse of the TadaIQ Services by its Contractors or any other Permitted User as if performed by Customer itself. All use of the TadaIQ Services by Permitted Users must be solely for the benefit of the Customer.
              </p>

              <h3 className="text-xl font-semibold text-gray-900">
                1.3 General Restrictions
              </h3>
              <p className="mb-6">
                Customer shall not (and shall not permit any third party to) do any of the following:
              </p>

              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>(a)</strong> Rent, lease, sublicense, sell, resell, or otherwise provide access to the TadaIQ Services to any third party (except Permitted Users as allowed above);
                </li>
                <li>
                  <strong>(b)</strong> everse engineer, decompile, disassemble, or otherwise attempt to discover or obtain the source code of any TadaIQ Services or software (except to the limited extent such restriction is prohibited by applicable law, and then only with prior notice to TadaIQ);
                </li>
                <li>
                  <strong>(c)</strong> Modify, create derivative works of, or copy the TadaIQ Services or Documentation (except as expressly permitted by this Agreement or the Documentation);
                </li>
                <li>
                  <strong>(d)</strong> Use the TadaIQ Services to send, store, or transmit any content or material that is unlawful, libelous, harassing, defamatory, obscene, or otherwise objectionable, including content that infringes on any third-party rights or privacy rights, or any material harmful to minors;
                </li>
                <li>
                  <strong>(e)</strong> Upload, transmit, or introduce into the TadaIQ Services any viruses, worms, Trojan horses, malware, or other harmful code;
                </li>
                <li>
                  <strong>(f)</strong> Use the TadaIQ Services in a manner that could disrupt, disable, damage, or overburden the services or interfere with any other party’s use of the services, or that could damage or harm TadaIQ’s systems or infrastructure;
                </li>
                <li>
                  <strong>(g)</strong> Use the TadaIQ Services for any purpose or in any manner that violates any applicable law or regulation, including data protection laws, or infringes any third-party rights;
                </li>
                <li>
                  <strong>(h)</strong> Remove, alter, or obscure any proprietary notices (e.g., copyright or trademark notices) on the TadaIQ Services, Documentation, or any reports or data exported from the TadaIQ platform;
                </li>
                <li>
                  <strong>(i)</strong> Use any automated means (such as bots, scrapers, or crawlers) to access or extract data from the TadaIQ Services that is not intended to be provided to Customer, or frame or mirror any part of the TadaIQ Services; or
                </li>
                <li>
                  <strong>(j)</strong> Publicly disclose or publish any benchmarks, performance, or security testing results, or other comparative analysis relating to the TadaIQ Services without TadaIQ’s prior written consent.
                </li>
              </ul>

              <p className="mb-6">Any violation of these restrictions by Customer or its Permitted Users shall be deemed a material breach of this Agreement by Customer.</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                1.4 Evaluation or Trial Use
              </h3>
              <p>
                If Customer is provided access to TadaIQ Services on a no-fee, trial, or evaluation basis (“Evaluation Use”), such use is permitted only for the period and purposes designated by TadaIQ. TadaIQ may terminate or suspend any Evaluation Use at any time, with or without notice, and for any reason. During an Evaluation Use, the TadaIQ Services are provided “as is” without any warranties, and all other terms of this Agreement still apply. Sections of this Agreement specific to fee-based services (such as payment obligations, certain support commitments, or the service warranty in Section 7.2) may not apply to Evaluation Use.
              </p>
            </section>

            <section className="mb-8 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                2. DATA INSIGHTS AND SERVICES
              </h2>

              <h3 className="text-xl font-semibold text-gray-900">
                2.1 Data Insights: Definition
              </h3>
              <p>
                Through the TadaIQ Services, customers may access information, datasets, reports, and other market intelligence data that TadaIQ has collected or obtained (“Data Insights”). Data Insights may consist of (i) Collected Data, which is data gathered specifically at Customer’s direction or request (for example, data collected via a custom mission for the Customer); and/or (ii) Licensed Data, which is data that TadaIQ or its partners have gathered independently (for example, through ongoing general data collection efforts) and made available to multiple customers. The Order Document will specify the type of Data Insights provided (if not, the default terms below apply).
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                2.2 Collected Data (Customer-Specific Data)
              </h3>
              <p>
                To the extent TadaIQ collects data specifically for the Customer as part of a custom mission or project described in an Order Document, such data is “Collected Data.” Subject to full payment of any fees for the custom mission, Customer will own all intellectual property rights in the Collected Data. TadaIQ hereby assigns to Customer all rights TadaIQ may have in such Collected Data, and will, at Customer’s request and expense, execute further documents reasonably necessary to perfect Customer’s ownership. TadaIQ may retain an archival copy of Collected Data for legal compliance and internal record-keeping, but will not use or disclose Customer’s Collected Data to other customers. Data Retrieval and Deletion: Customer may request deletion of specific Collected Data (including any personal data, photos, or media) by providing written notice to TadaIQ. TadaIQ is not intended to serve as permanent data storage or archiving for the Customer. TadaIQ will not intentionally delete any Collected Data less than thirty (30) days old without the Customer’s request. Upon termination of this Agreement or the relevant Order, TadaIQ will, for thirty (30) days, make available to Customer a download or export of Collected Data in TadaIQ’s possession. After this 30-day post-termination period, TadaIQ may delete or destroy the Collected Data, unless legally prohibited. Any additional assistance by TadaIQ in transferring data after termination may be offered at TadaIQ’s then-current consulting rates and is subject to agreement by TadaIQ.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                2.3 Licensed Data
              </h3>
              <p>
                To the extent the Data Insights provided to Customer consist of data that TadaIQ makes available as part of its standard services or to other customers (and not collected uniquely for Customer), such data is “Licensed Data.” TadaIQ grants Customer a perpetual, worldwide, non-exclusive, non-transferable (except in connection with an assignment of this Agreement), non-sublicensable license to use the Licensed Data internally within Customer’s organization for its business purposes. Customer may internally analyze and create reports using Licensed Data, but shall not sell, publish, distribute, or otherwise commercially exploit the raw Licensed Data itself to any third party. All Licensed Data is provided “as is” and remains subject to the confidentiality obligations in this Agreement. TadaIQ and its data providers retain all ownership rights in the Licensed Data.
              </p>
            </section>

            <section className="mb-8 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                3. CUSTOMER DATA
              </h2>

              <h3 className="text-xl font-semibold text-gray-900">
                3.1 Definition and Compliance. 
              </h3>
              <p>
                “Customer Data” means any data, information, or material that Customer or its Permitted Users input or upload into the TadaIQ Services, or otherwise provide to TadaIQ, in the course of using the services. This may include, for example, account registration information (such as user names and contact details), content or instructions for custom missions, or data sets that Customer uploads for analysis. Customer is solely responsible for the accuracy, quality, legality, and appropriateness of all Customer Data. Customer represents and warrants that it has all necessary rights and permissions to provide the Customer Data to TadaIQ and to grant the rights outlined in this Agreement. Compliance with Laws: Customer shall ensure that its provision and use of Customer Data in the TadaIQ Services (including the collection, transfer, and processing of any personal data within the Customer Data) complies with all applicable laws and regulations, including data protection and privacy laws. This includes, without limitation, laws applicable to personal data from individuals in any relevant jurisdictions (such as the EU General Data Protection Regulation “GDPR”, the California Consumer Privacy Act “CCPA”, and applicable Ivorian data protection law). If Customer uploads personal data, Customer is responsible for obtaining any required consents or authorizations from individuals and for providing any necessary notices to individuals regarding the processing of their data by TadaIQ as a service provider.
              </p>

              <h3 className="text-xl font-semibold text-gray-900">
                3.2 Rights to Customer Data.
              </h3>
              <p>
                As between the parties, Customer retains all right, title, and interest (including intellectual property rights) in and to the Customer Data. Except as expressly provided in this Agreement, TadaIQ acquires no rights in the Customer Data. Customer grants to TadaIQ and its subcontractors a limited, non-exclusive right to use, process, store, and transmit the Customer Data solely as necessary to provide the TadaIQ Services to Customer, to prevent or address technical or security issues, or as otherwise required by law. TadaIQ will not access Customer Data except as necessary to provide the services, to enforce its rights under this Agreement, or as required by law. Nothing in this Agreement shall be construed to limit Customer’s rights to its own Customer Data.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                3.3 Customer Data Uploads
              </h3>
              <p>
                Customer is responsible for uploading or providing Customer Data in a format and manner that meets the technical requirements communicated by TadaIQ (for example, supported file formats or data schemas). TadaIQ is not responsible for any delay or inability to perform the services caused by Customer’s failure to provide Customer Data in the required format. TadaIQ will provide reasonable cooperation and guidance on format or integration requirements upon request.
              </p>
            </section>

            <section className="mb-8 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                4. INTELLECTUAL PROPERTY OWNERSHIP
              </h2>

              <h3 className="text-xl font-semibold text-gray-900">
                4.1 TadaIQ Intellectual Property
              </h3>
              <p>
                Except for the rights expressly granted to Customer in this Agreement, all rights, title, and interest in and to the TadaIQ Services, the Documentation, the Data Insights (subject to Customer’s ownership of Collected Data per Section 2.2), and all software, technology, and intellectual property provided or used by TadaIQ in connection with the services, are and shall remain the exclusive property of TadaIQ and/or its licensors. TadaIQ reserves all rights not expressly granted to Customer under this Agreement. Customer is obtaining a limited subscription right to use the TadaIQ Services and Data Insights as provided herein, and no ownership of any software or underlying technology is transferred to Customer.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                4.2 No Implied Licenses; Feedback
              </h3>
              <p>
                There are no implied licenses under this Agreement. Customer will not exceed the scope of the access rights granted herein. If Customer or any Permitted User provides TadaIQ with any suggestions, enhancement requests, recommendations, or other feedback regarding the TadaIQ Services or related processes (“Feedback”), TadaIQ may freely use and incorporate such Feedback into its products and services. Customer hereby grants TadaIQ a worldwide, irrevocable, perpetual, sublicensable, transferable, royalty-free license to use and exploit any Feedback for any purpose, without obligation or compensation to Customer. Feedback is provided “as is,” and Customer shall ensure no confidential or proprietary information of Customer or third parties is included in Feedback submitted to TadaIQ.
              </p>
            </section>

            <section className="mb-8 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                5. FEES AND PAYMENT
              </h2>

              <h3 className="text-xl font-semibold text-gray-900">
                5.1 Fees and Payment Terms
              </h3>
              <p>
                Customer agrees to pay all fees specified in the Order Document or as otherwise agreed for the TadaIQ Services. Unless otherwise stated in an Order Document, fees for subscriptions are due in advance at the start of the subscription term (and for any renewal term on the renewal date), and fees for one-time services or missions are due as specified by TadaIQ (e.g., upon ordering the mission or completion of data collection). TadaIQ will invoice Customer, or charge Customer’s provided payment method, according to the agreed billing schedule. Fees are typically quoted and payable in United States Dollars (USD), unless another currency is specified by TadaIQ or in the Order Document. All payments shall be made in full, without set-off or deduction. The customer is responsible for providing complete and accurate billing and contact information to TadaIQ and notifying TadaIQ of any changes to such information.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                5.2 Taxes
              </h3>
              <p>
                All fees are exclusive of any sales, value-added, goods and services, withholding, or other taxes or duties. Customer is responsible for all taxes and duties (excluding taxes based on TadaIQ’s net income) associated with the Services or payments made under this Agreement. If any such taxes are required to be withheld, Customer shall pay an amount to TadaIQ such that the net amount received by TadaIQ after withholding of taxes equals the amount TadaIQ would have received if no taxes had been required. TadaIQ will include any applicable taxes on its invoices as required by law, and Customer agrees to pay such taxes unless Customer provides a valid tax-exemption certificate.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                5.3 Non-Cancellation and Late Payments
              </h3>
              <p>
                Except as expressly provided in Section 7.2 (Warranty Remedy) or if otherwise agreed in writing, all payment obligations are non-cancellable and all amounts paid are non-refundable. If Customer believes an invoice is incorrect, Customer must contact TadaIQ in writing within fifteen (15) days of the invoice date to dispute the charge, otherwise, the invoice amount will be deemed accepted. Undisputed amounts not paid by the due date may accrue interest at the rate of one and one-half percent (1.5%) per month (or the highest rate permitted by law, if lower), from the due date until paid. Customer shall reimburse TadaIQ for any costs of collecting overdue payments, including reasonable attorneys’ fees.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                5.4 Overage and Fee Adjustments
              </h3>
              <p>
                Customer’s use of the TadaIQ Services is subject to any usage limits (for example, number of data points, missions, users, or other metrics) specified in the Order Document or the service plan. If the Customer’s usage exceeds those limits, TadaIQ reserves the right to charge overage fees at its standard pricing or as stated in the Order Document. TadaIQ may monitor usage and invoice for any overages. Additionally, for subscription services, TadaIQ may adjust its standard fees or rates at the time of renewal. TadaIQ will provide at least forty-five (45) days’ notice (which may be by email or through the service) before the end of the then-current term if fees will be increased at renewal (beyond any automatic increase set forth below). If Customer objects to the fee increase, Customer may choose not to renew the subscription by providing written notice of non-renewal before the renewal date, as described in Section 6.1. Notwithstanding the foregoing, TadaIQ may automatically increase the fees for any renewal term by the greater of three percent (3%) or the percentage increase in the Consumer Price Index (CPI) over the prior year, to account for inflation and service improvements, and may do so without additional advance notice.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                5.5 Suspension of Service for Non-Payment
              </h3>
              <p>
                If any invoiced amount is overdue by more than five (5) days (and Customer has not reasonably disputed the charges), TadaIQ may, after giving at least a warning notice (which may be by email), suspend Customer’s access to the TadaIQ Services until such overdue amounts are paid in full. Suspension of services for non-payment shall not prejudice TadaIQ’s right to terminate this Agreement for material breach under Section 6.2 or to pursue other remedies. The customer will remain responsible for all fees during any suspension period and for any costs incurred by TadaIQ due to the suspension or resumption of services.
              </p>
            </section>

            <section className="mb-8 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                6. TERM AND TERMINATION
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900">
                6.1 Term of Agreement and Orders
              </h3>
              <p>
                This Agreement commences on the Effective Date and continues until terminated as set forth herein. Each Order Document will specify an initial subscription or service term for the TadaIQ Services. Unless otherwise stated in an Order Document, subscriptions will automatically renew for additional periods equal to the expiring term (e.g., a one-year term will renew for another one-year term) unless either party gives the other written notice of non-renewal at least thirty (30) days before the end of the then-current term. TadaIQ reserves the right to reasonably increase fees or change the service scope at the time of renewal, subject to Section 5.4. If no initial term is specified in an Order Document, the default initial term is one (1) year from the service start date.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                6.2 Termination for Cause
              </h3>
              <p>
                Either party may terminate this Agreement (including all Order Documents) before its expiration if the other party materially breaches this Agreement and fails to cure such breach within thirty (30) days after receiving written notice detailing the breach (or ten (10) days in the case of Customer’s failure to pay fees when due). A notice of breach must expressly state the intent to terminate if the breach is not cured. Additionally, either party may terminate this Agreement immediately upon written notice if the other party: (a) ceases its business operations or becomes subject to any bankruptcy or insolvency proceeding and the proceeding is not dismissed within ninety (90) days; or (b) is found to violate applicable law in a manner that would prevent the performing of this Agreement (such as being barred by data protection authorities from processing data necessary for the services). Termination of the Agreement will automatically terminate all active Order Documents, unless otherwise agreed in writing by the parties. If no Order Documents are in effect, either party may terminate this Agreement for convenience with thirty (30) days’ written notice to the other.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                6.3 Effect of Termination
              </h3>
              <p>
                Upon expiration or termination of this Agreement for any reason: (i) Customer shall immediately cease all use of the TadaIQ Services and shall no longer access the platform or use any TadaIQ software; (ii) Customer will promptly return or (at TadaIQ’s election) destroy any TadaIQ Confidential Information (defined in Section 10) and any TadaIQ materials or Documentation in its possession; and (iii) any fees owed by Customer up to the effective date of termination shall become immediately due and payable. If this Agreement or an Order is terminated by Customer for TadaIQ’s uncured breach under Section 6.2, TadaIQ will refund any prepaid fees covering the period of the subscription remaining after the effective date of termination (on a pro-rata basis). Except in the case of termination by Customer for TadaIQ’s breach, all fees paid or payable to TadaIQ under the Agreement are non-refundable. Termination shall not relieve either party of obligations that by their nature are intended to survive termination.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                6.4 Survival
              </h3>
              <p>
                The following provisions will survive any expiration or termination of this Agreement: Sections 2.3 (Licensed Data license, concerning any Data Insights provided before termination), 3.2 (Customer’s continued ownership of Customer Data and TadaIQ’s rights thereto), 4 (Intellectual Property Ownership), 5 (Fees) to the extent of any unpaid fees or refund obligations, 6.3 and 6.4 (Effects of Termination and Survival), 7.3 (Warranty Disclaimer), 8 (Limitation of Liability), 9 (Indemnification) if applicable, 10 (Confidential Information), 11 (Publicity/Logo Usage), 12 (General Terms), and any other provision which by its terms or nature should reasonably survive termination. All accrued rights to payment and remedies for breach shall survive.
              </p>
            </section>

            <section className="mb-8 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                7. WARRANTIES AND DISCLAIMERS
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900">
                7.1 Mutual Warranties
              </h3>
              <p>
                Each party represents and warrants that: (a) it is a business entity duly organized, validly existing, and in good standing under the laws of its jurisdiction of formation; (b) it has the full corporate power and authority to enter into this Agreement and to perform its obligations hereunder; and (c) this Agreement constitutes a legal, valid, and binding obligation enforceable against that party by its terms. Each party further represents that it will comply with all laws and regulations applicable to its performance or use of the TadaIQ Services under this Agreement, including applicable export control laws and data protection laws. In particular, TadaIQ warrants that it will process any personal data within the Customer Data or Collected Data by its Privacy Policy and applicable data protection laws and regulations, including, as applicable, the GDPR, CCPA, and Ivorian personal data protection law. If the GDPR applies to personal data processed under this Agreement, and such data is transferred outside the European Economic Area, the parties shall take necessary measures to ensure compliance (for example, by entering into appropriate Standard Contractual Clauses or other transfer mechanisms as required by the GDPR).
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                7.2 TadaIQ Service Warranty
              </h3>
              <p>
                TadaIQ warrants to Customer that, during any paid subscription term, the TadaIQ Services will operate in substantial conformity with the applicable Documentation and any service level commitments expressly agreed in writing. TadaIQ will use commercially reasonable efforts to make the platform available on a 24/7 basis, except for planned maintenance or updates and except for downtime outside of TadaIQ’s reasonable control. In the event of any breach of the foregoing warranty, Customer’s exclusive remedy and TadaIQ’s sole obligation shall be for TadaIQ, at its option, to: (a) use commercially reasonable efforts to correct the reported non-conformity or provide a workaround to mitigate its effects; or (b) if TadaIQ determines such remedy to be impracticable within a reasonable time, terminate the affected Service and refund to Customer any pre-paid fees covering the remainder of the term of the terminated Service (from the date of termination). To receive warranty remedies, the Customer must promptly report the issue to TadaIQ in writing, and in any case, no later than thirty (30) days after the issue first occurs. This warranty will not apply if the problem arises from any misuse of the TadaIQ Services, use of the services not by the Documentation, modifications made by anyone other than TadaIQ or its authorized agents, or from combining the TadaIQ Services with any third-party systems not supported by TadaIQ.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                7.3 Disclaimer of Warranties
              </h3>
              <p>
                Except as expressly provided in this Agreement, the TadaIQ Services, Data Insights (including Collected Data and Licensed Data), and any software or guidance provided by TadaIQ are provided “AS IS” and “AS AVAILABLE”. To the maximum extent permitted by law, TadaIQ and its licensors make no other warranties or conditions, express or implied, including any implied warranties of merchantability, fitness for a particular purpose, title, non-infringement, or any warranties arising from course of dealing or trade usage. TadaIQ does not warrant that the services or data will be uninterrupted or error-free, or that it will meet the Customer’s requirements. Customer assumes all responsibility for determining whether the TadaIQ Services or the Data Insights are sufficient for Customer’s purposes. No advice or information obtained from TadaIQ or through the services shall create any warranty not expressly stated in this Agreement. The limited warranties in Section 7.2 (Service Warranty) do not apply to any free, trial, or Evaluation Use of the TadaIQ Services, which are provided strictly “as-is” without warranty of any kind.
              </p>
            </section>
            <section className="mb-8 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                8. LIMITATION OF LIABILITY
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900">
                8.1 Types of Damages
              </h3>
              <p>
                To the fullest extent permitted by applicable law, neither party shall be liable to the other for any indirect, special, incidental, consequential, or punitive damages, or for any loss of profits, revenue, goodwill, data, or business interruption, arising out of or related to this Agreement or the use or inability to use the TadaIQ Services, regardless of the theory of liability (contract, tort, or otherwise), and even if that party has been advised of the possibility of such damages or such damages were foreseeable. The parties agree that these exclusions reflect a reasonable allocation of risk.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                8.2 Liability Cap
              </h3>
              <p>
                To the fullest extent permitted by law, each party’s total cumulative liability to the other (and to any other person or entity claiming through the other) for all claims and expenses arising out of or related to this Agreement, whether in contract, tort (including negligence), or otherwise, shall not exceed the total amount of fees paid (or, in the case of amounts due but not yet paid, owed) by Customer to TadaIQ under this Agreement in the twelve (12) months immediately preceding the event giving rise to the claim. If no fees were paid (for example, during a free trial) or if the claim arises after the end of a paid term, the liability of TadaIQ shall not exceed US$ $1,000 (one thousand U.S. dollars) in the aggregate. The existence of multiple claims or events shall not enlarge this cap.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                8.3 Exceptions
              </h3>
              <p>
                The limitations in this Section 8 shall not apply to: (i) a party’s indemnification obligations under Section 9 (to the extent of any amounts paid to third parties in settlement or judgment); (ii) Customer’s payment obligations for services rendered; (iii) damages resulting from a party’s gross negligence or willful misconduct; or (iv) liability that cannot be limited by law (such as certain statutory liabilities or liability for personal injury caused by negligence). In addition, nothing in this Agreement limits Customer’s obligation to pay any undisputed fees owed to TadaIQ under this Agreement, nor does it limit either party’s liability for misuse or misappropriation of the other party’s intellectual property or Confidential Information in breach of this Agreement.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                8.4 Basis of Bargain
              </h3>
              <p>
                Each party acknowledges that the fees and consideration under this Agreement reflect the allocation of risk outlined in this Section 8, and that the parties would not enter into this Agreement without these limitations of liability. The limitations shall apply notwithstanding any failure of the essential purpose of any limited remedy.
              </p>
            </section>

            <section className="mb-8 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                9. INDEMNIFICATION
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900">
                9.1 TadaIQ’s IP Indemnity
              </h3>
              <p>
                TadaIQ shall defend Customer, and its officers, directors, and employees, from and against any claim by an unaffiliated third party alleging that the TadaIQ Services, as provided by TadaIQ and used by Customer by this Agreement, directly infringe a valid patent, copyright, or trademark, or misappropriate a third party’s trade secret (a “Claim”). TadaIQ will indemnify Customer against any damages, attorneys’ fees, and costs finally awarded by a court of competent jurisdiction or agreed in settlement for such Claim, provided that Customer: (a) promptly notifies TadaIQ in writing of the Claim (delay in notice will relieve TadaIQ of its obligation only if it prejudiced the defense); (b) gives TadaIQ sole control of the defense and settlement of the Claim (provided that any settlement that imposes non-monetary obligations on Customer will require Customer’s consent); and (c) provides TadaIQ with all reasonable assistance, at TadaIQ’s expense. Section 9.1 states TadaIQ’s entire liability and Customer’s exclusive remedy for any intellectual property infringement or misappropriation claims relating to the TadaIQ Services.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                9.2 Mitigation and Exceptions
              </h3>
              <p>
                In the event a Claim under Section 9.1 is brought or threatened, TadaIQ may, at its sole option and expense, seek to mitigate the issue by: (i) obtaining for Customer the right to continue using the TadaIQ Services; (ii) modifying or replacing the allegedly infringing portion of the TadaIQ Services so that it becomes non-infringing while maintaining substantially equivalent functionality; or (iii) if TadaIQ determines that the remedies in (i) and (ii) are not reasonably available, terminating Customer’s use of the affected TadaIQ Services and refunding any pre-paid fees for the terminated portion of the subscription term. TadaIQ will not have any obligation under this Section 9 (Indemnification) for any claim resulting from: (1) modification of the TadaIQ Services by anyone other than TadaIQ or use of the Services in combination with any software, hardware, or data not provided by TadaIQ, if the infringement would not have occurred but for such modification or combination; (2) Customer Data or third-party materials provided by Customer (including any instructions or specifications from Customer to TadaIQ); or (3) use of the TadaIQ Services not strictly by this Agreement or the Documentation. Customer shall indemnify and hold harmless TadaIQ and its affiliates against any claims, losses, or liabilities arising out of Customer’s use of the TadaIQ Services in violation of law or of any third-party rights, or arising from the Customer Data (except to the extent any such claim is covered by TadaIQ’s indemnity above). The indemnified party shall comply with the same obligations of prompt notice, control, and assistance for any claims covered by this Customer indemnity.
              </p>
            </section>

            <section className="mb-8 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                10. CONFIDENTIAL INFORMATION
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900">
                10.1 Definition
              </h3>
              <p>
                “Confidential Information” means any non-public or proprietary information disclosed by one party (the “Disclosing Party”) to the other party (the “Receiving Party”) that is designated as confidential or that should reasonably be understood to be confidential given the nature of the information and the circumstances of disclosure. TadaIQ’s Confidential Information includes, without limitation, the TadaIQ Services (including any software, source code, algorithms, and pricing information related to the services), any non-public Data Insights (e.g., Licensed Data provided to Customer), and the terms of this Agreement and any Order Documents. Customer’s Confidential Information includes Customer Data (excluding any data that is Collected Data owned by Customer, which Customer owns outright per Section 2.2) and any non-public information about Customer’s business or technology that may be disclosed to TadaIQ. Confidential Information does not include information that the Receiving Party can demonstrate: (a) was already known to the Receiving Party without restriction on use or disclosure before receiving it from the Disclosing Party; (b) is or becomes generally known to the public through no fault of the Receiving Party (and without breach of any confidentiality obligation); (c) is independently developed by the Receiving Party without reference to or use of the Disclosing Party’s Confidential Information; or (d) is lawfully obtained by the Receiving Party from a third party who has the right to disclose it without restriction.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                10.2 Protection of Confidential Information
              </h3>
              <p>
                The Receiving Party shall use the Disclosing Party’s Confidential Information only to perform its obligations or exercise its rights under this Agreement and shall not disclose such Confidential Information to any third party except as permitted in this Section. The Receiving Party agrees to protect the Disclosing Party’s Confidential Information from unauthorized use, access, or disclosure with at least the same degree of care that it uses to protect its confidential information of a similar nature, and in no event less than a reasonable standard of care. The Receiving Party may disclose Confidential Information only to its employees, Contractors, or professional advisors (e.g., attorneys, accountants) who need to know it for this Agreement and who are bound by confidentiality obligations at least as protective as those in this Agreement. The Receiving Party shall be responsible for any breach of confidentiality by any person to whom it discloses the Disclosing Party’s Confidential Information.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                10.3 Compelled Disclosure
              </h3>
              <p>
                If the Receiving Party is required by law, regulation, or court order to disclose any of the Disclosing Party’s Confidential Information, the Receiving Party shall (if legally permitted) provide prompt written notice to the Disclosing Party to enable it to seek a protective order or otherwise prevent or limit the disclosure. The Receiving Party shall disclose only that portion of the Confidential Information which it is legally required to disclose and shall use commercially reasonable efforts to ensure that the disclosed information is treated confidentially.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                10.4 Return or Destruction
              </h3>
              <p>
                Upon expiration or termination of this Agreement, or the Disclosing Party’s written request, the Receiving Party shall promptly return or destroy (at the Disclosing Party’s election) all Confidential Information of the Disclosing Party in its possession or control, and permanently delete any electronic copies, except that the Receiving Party may retain one archival copy of Confidential Information solely for evidentiary purposes and to demonstrate compliance with this Agreement. Any retained Confidential Information remains subject to the confidentiality obligations of this Agreement.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                10.5 Remedies
              </h3>
              <p>
                The Receiving Party acknowledges that unauthorized disclosure of the Disclosing Party’s Confidential Information may cause substantial harm that cannot be remedied solely by monetary damages. Therefore, in the event of any actual or threatened breach of this Section 10, the Disclosing Party will be entitled, in addition to any other remedies it may have, to seek injunctive or other equitable relief without the requirement of posting a bond or proving damages.
              </p>
            </section>

            <section className="mb-8 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                11. PUBLICITY AND LOGO USAGE
              </h2>

              <p>
                During the term of this Agreement, TadaIQ may include Customer’s name and logo in its customer lists on its website, in press releases, marketing materials, presentations, case studies, or whitepapers, to identify Customer as a user of the TadaIQ Services. Any such use will be by any branding guidelines that Customer provides and will be limited to indicating that Customer is a client of TadaIQ. TadaIQ will cease further use of the Customer’s name and logo upon the Customer’s written request (email is sufficient) or within a reasonable time after termination of this Agreement, except that TadaIQ may maintain prior use in archived materials. Customer agrees that TadaIQ’s use of its name and logo as described above, during and for a reasonable time after the term, does not violate Customer’s rights, provided that no personal data or Confidential Information of Customer is disclosed. Except for the foregoing, neither party will use the other’s name, logos, or trademarks without prior written consent.
              </p>
            </section>

            <section className="mb-8 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                12. GENERAL TERMS
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900">
                12.1 Assignment
              </h3>
              <p>
                Neither party may assign or transfer this Agreement, in whole or in part, without the other party’s prior written consent. Any attempt to assign this Agreement without such consent will be null and void. However, either party may assign this Agreement without consent to an affiliate or to a successor in interest in connection with a merger, acquisition, corporate reorganization, or sale of all or substantially all of its assets or business to which this Agreement relates, provided that the assignee agrees in writing to be bound by all terms of this Agreement and the assigning party notifies the other party of the assignment. Subject to the foregoing, this Agreement will bind and inure to the benefit of the parties’ respective successors and permitted assigns.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                12.2 Independent Contractors
              </h3>
              <p>
                The relationship of TadaIQ and Customer established by this Agreement is that of independent contractors. This Agreement does not create any agency, partnership, joint venture, or fiduciary relationship between the parties. Neither party has any authority to bind or obligate the other party in any manner, whether by contract or otherwise, unless expressly agreed in writing. Each party remains solely responsible for paying its own employees’ and contractors’ compensation, benefits, and applicable taxes.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                12.3 Subcontractors
              </h3>
              <p>
                TadaIQ may use subcontractors or third-party service providers to perform certain services or parts of the TadaIQ Services (for example, data hosting, analytics, or payment processing), provided that TadaIQ remains responsible for the performance of such subcontractors under this Agreement. TadaIQ will ensure that any subcontractors are bound by obligations of confidentiality and data protection no less protective than those outlined in this Agreement to the extent applicable to their work.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                12.4 Force Majeure
              </h3>
              <p>
                Neither party shall be liable for any failure or delay in performing its obligations (except for payment obligations) under this Agreement if such failure or delay is caused by circumstances beyond its reasonable control, including, but not limited to, acts of God, war, terrorism, civil unrest, government restrictions or actions, strikes or labor disputes, electrical or power outages, internet or telecommunications failures, epidemics or pandemics, fire, flood, or other natural disasters (“Force Majeure Event”). The party affected by a Force Majeure Event shall give prompt notice to the other party with details of the event and an estimation of the expected duration of the delay. If a Force Majeure Event continues for more than ten (10) consecutive days and materially affects the ability of a party to perform its obligations, either party may terminate this Agreement upon written notice to the other. In such a case, each party will bear its costs arising from the termination, and Customer will be entitled to a pro-rata refund of any fees paid for the period during which the services could not be provided due to the Force Majeure Event (if applicable).
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                12.5 Severability
              </h3>
              <p>
                If any provision of this Agreement is held by a court of competent jurisdiction to be invalid, illegal, or unenforceable, that provision shall be enforced to the maximum extent permissible to effect the parties’ intent, or if incapable of such enforcement, shall be deemed severed from this Agreement. The remaining provisions of this Agreement will remain in full force and effect. The parties will negotiate in good faith a valid and enforceable provision to replace any unenforceable provision, reflecting the intent of the original provision as closely as possible.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                12.6 Governing Law and Jurisdiction
              </h3>
              <p>
                This Agreement and any disputes arising out of or relating to it shall be governed by the laws of the Republic of Côte d’Ivoire (Ivory Coast), without regard to its conflict of laws principles and regard to the U.N. Convention on Contracts for the International Sale of Goods. Each party agrees that any legal action or proceeding arising under this Agreement that is not subject to arbitration (if the parties mutually agree to arbitrate) shall be brought exclusively in the courts located in Abidjan, Côte d’Ivoire, and the parties irrevocably submit to the personal jurisdiction and venue of such courts. Each party waives any objection to jurisdiction or venue in such courts, including any claim of forum non conveniens. Notwithstanding the foregoing, either party may seek injunctive or other equitable relief in any court of competent jurisdiction to protect its intellectual property or Confidential Information. The parties agree that the prevailing party in any legal action or proceeding to enforce this Agreement shall be entitled to recover its reasonable attorneys’ fees and costs from the other party.
              </p>

              <h3 className="text-xl font-semibold text-gray-900">
                12.7 Notices
              </h3>
              <p>
                All notices, requests, consents, and other communications required or permitted under this Agreement (“Notices”) shall be in writing and shall be deemed given: (a) when delivered personally; (b) when sent by a reputable international overnight courier (with confirmation of delivery); or (c) when sent by email, provided that for legal notices an additional copy is sent by mail or courier. Notices shall be sent to the contact and address (including email address) set forth for each party in the Order Document or as either party otherwise specifies in writing. The initial notice address for Customer shall be any address provided by Customer in its account or Order Document, and for TadaIQ shall be: TadaIQ, Attn: Legal Department, Plateau, Abidjan, Côte d’Ivoire; Email: legal@tadaiq.com. Either party may update its notice contact information by giving notice to the other party under this Section. Notices shall be deemed received: if personally delivered, on receipt; if sent by overnight courier, on the next business day after dispatch; and if sent by email, when the email is transmitted (absent an error or bounce-back), provided that if the email is sent outside of recipient’s business hours, it will be deemed received on the next business day.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                12.8 Amendments and Waivers
              </h3>
              <p>
                No modification, amendment, or waiver of any provision of this Agreement shall be effective unless in writing and signed (including electronically signed) by an authorized representative of both parties. However, updates to TadaIQ’s Documentation or policies referenced in this Agreement may be made by TadaIQ from time to time, provided that such updates do not materially reduce Customer’s rights or benefits under the Agreement. The failure of either party to enforce any provision of this Agreement or to exercise any right or remedy shall not be construed as a present or future waiver of such provision, right, or remedy. A waiver on one occasion shall not be deemed a waiver of any other or subsequent breach or default.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900">
                12.9 Entire Agreement
              </h3>
              <p>
                This Agreement, together with all Order Documents and any documents incorporated by reference (such as a Privacy Policy or Data Processing Addendum, if applicable), constitutes the entire agreement between Customer and TadaIQ concerning the subject matter herein, and supersedes all prior or contemporaneous understandings, agreements, negotiations, representations, and communications, whether written or oral, between the parties regarding such subject matter. Each party acknowledges that it has not relied on any statement, representation, or warranty not expressly set out in this Agreement. In the event of any conflict between the terms of this Agreement and an Order Document, the Order Document shall control for that order, provided that any additional or conflicting terms in any purchase order or other Customer-provided document (apart from the expressly negotiated Order or an addendum signed by both parties) shall have no effect and are hereby rejected.
                By using or accessing the TadaIQ Services, or by signing an Order Document, Customer acknowledges that it has read and understood this Agreement and agrees to be bound by its terms. Suppose an individual is accepting this Agreement on behalf of a company or other legal entity. In that case, that individual represents that they have the authority to bind such entity to these terms. If Customer does not agree with these terms, Customer must not use the TadaIQ Services.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Contact Us
              </h2>
              <p className="mb-4">
                If you have any questions, concerns, or requests regarding this
                Privacy Policy or our data practices, please contact us:
              </p>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">By Email:</h4>
                  <p className="text-gray-700">
                    <a
                      href="mailto:privacy@tadaiq.com"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      privacy@tadaiq.com
                    </a>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    This is the fastest way to get a response regarding your
                    privacy questions.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">By Mail:</h4>
                  <address className="text-gray-700 not-italic">
                    Tada Sarl – Privacy Office
                    <br />
                    Abidjan, Plateau Indenié
                    <br />
                    Côte d'Ivoire
                  </address>
                  <p className="text-sm text-gray-600 mt-1">
                    (Please include “Attn: Privacy” or “Attn: Legal” in your
                    letter so it gets to the right team. If you are writing from
                    outside Côte d’Ivoire, please note that international mail may
                    take some time to arrive.)
                  </p>
                </div>
              </div>
            </section>

            {/* Footer Note */}
            <section className="text-center py-8 border-t">
              <p className="text-gray-600">
                We will do our best to address and resolve any privacy-related
                issues you bring to our attention. If you feel that we have not
                addressed your concern satisfactorily, you may have the option to
                contact your local data protection authority or privacy regulator
                as mentioned above.
              </p>
              <p className="text-gray-600">
                Thank you for taking the time to read our Privacy Policy. We
                appreciate your trust in Tada, and we are committed to
                safeguarding your personal information while providing a valuable
                service.
              </p>
            </section>
          </div>
        </div>

        {/* SIDEBAR MENU RESPONSIVE */}
        <RightMenu page="saas_agreement" />
      </div>
    </div>
  );
}
