import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { generateMetadata } from "../metadata";
import { getI18n } from "@/locales/server";

export const metadata = generateMetadata({
  title: "Contact Us - Sales, Support & Customer Service | Tada",
  description:
    "Want to get in touch? Here's how you can contact us for sales, support, and media inquiries.",
});

export default async function ContactPage() {
  const t = await getI18n();
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-white py-16 md:py-20">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-rational-bold text-center mb-6">
            {t("get_in_touch.title")}
          </h1>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto">
            {t("get_in_touch.description")}
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sales */}
            <div className="bg-black text-white rounded-lg overflow-hidden">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image
                    src="https://ext.same-assets.com/829373065/2258222804.svg"
                    alt="Sales Icon"
                    width={40}
                    height={40}
                  />
                </div>
                <h2 className="text-2xl font-rational-semibold mb-3">
                  {t("get_in_touch.sales.title")}
                </h2>
                <p className="text-gray-300 mb-6">
                  {t("get_in_touch.sales.description")}
                </p>

                <ul className="text-left space-y-3 mb-6">
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>{t("get_in_touch.sales.learn_more")}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>{t("get_in_touch.sales.explore_use_cases")}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>{t("get_in_touch.sales.schedule_a_demo")}</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>{t("get_in_touch.sales.get_pricing_info")}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contributors Support */}
            <div className="bg-black text-white rounded-lg overflow-hidden">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image
                    src="https://ext.same-assets.com/829373065/381223219.svg"
                    alt="Contributors Support Icon"
                    width={40}
                    height={40}
                  />
                </div>
                <h2 className="text-2xl font-rational-semibold mb-3">
                  {t("get_in_touch.contributors_support.title")}
                </h2>
                <p className="text-gray-300 mb-6">
                  {t("get_in_touch.contributors_support.description")}
                </p>

                <ul className="text-left space-y-3 mb-6">
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>
                      {t("get_in_touch.contributors_support.get_started")}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>
                      {t("get_in_touch.contributors_support.manage_my_account")}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>
                      {t(
                        "get_in_touch.contributors_support.manage_tada_earnings"
                      )}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>
                      {t("get_in_touch.contributors_support.submit_ticket")}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Media & Press */}
            <div className="bg-black text-white rounded-lg overflow-hidden">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image
                    src="https://ext.same-assets.com/829373065/3552321698.svg"
                    alt="Media & Press Icon"
                    width={40}
                    height={40}
                  />
                </div>
                <h2 className="text-2xl font-rational-semibold mb-3">
                  {t("get_in_touch.media_press.title")}
                </h2>
                <p className="text-gray-300 mb-6">
                  {t("get_in_touch.media_press.description")}
                </p>

                <ul className="text-left space-y-3 mb-6">
                  <li className="flex items-center">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>
                      {t("get_in_touch.media_press.submit_media_request")}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Media Inquiry Form */}
      <section className="py-16 bg-white">
        <div className="container-custom max-w-3xl">
          <h2 className="text-2xl font-rational-bold mb-8">
            {t("get_in_touch.form.media_inquiry")}
          </h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first-name">
                  {t("get_in_touch.form.first_name")}*
                </Label>
                <Input id="first-name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">
                  {t("get_in_touch.form.last_name")}*
                </Label>
                <Input id="last-name" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="work-email">
                {t("get_in_touch.form.work_email")}*
              </Label>
              <Input id="work-email" type="email" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="media-outlet">
                {t("get_in_touch.form.media_outlet")}*
              </Label>
              <Input id="media-outlet" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">{t("get_in_touch.form.subject")}*</Label>
              <Input id="subject" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inquiry">
                {t("get_in_touch.form.inquiry_description")}*
              </Label>
              <textarea
                id="inquiry"
                className="w-full min-h-[150px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-premise-blue"
                required
              />
            </div>

            <Button
              type="submit"
              className="bg-black hover:bg-gray-800 text-white py-2 px-6"
            >
              {t("get_in_touch.form.submit")}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
