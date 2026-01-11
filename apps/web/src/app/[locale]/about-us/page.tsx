import { Features } from "@/components/features";
import { DefaultTestimonial } from "@/components/testimonials";
import Image from "next/image";
import Link from "next/link";
import { generateMetadata } from "../metadata";
import { getI18n } from "@/locales/server";
import {
  TrendingUp,
  Users,
  Globe,
  Eye,
  Target,
  BarChart3,
  Settings,
  Database,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import WhatMakesUsUnique from "@/components/what-make-is-unique";
import { Button } from "@tada/ui/components/button";

export const metadata = generateMetadata({
  title: "Tada - Insight, Everywhere, Instantly™",
  description:
    "Harness the power of data-driven intelligence and get actionable insights quickly and cost-effectively with Tada.",
});

export default async function AboutUs() {
  const t = await getI18n();
  return (
    <div className="flex flex-col px-4 md:px-16">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {t("about_us.title")} <span className="text-primary">Tada</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              {t("about_us.subtitle")}
            </p>

            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("about_us.real_time_data")}
                </h3>
                <p className="text-gray-600">
                  {t("about_us.real_time_data_description")}
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("about_us.global_community")}
                </h3>
                <p className="text-gray-600">
                  {t("about_us.global_community_description")}
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                  <Globe className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("about_us.actionable_insights")}
                </h3>
                <p className="text-gray-600">
                  {t("about_us.actionable_insights_description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="vision" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("about_us.vision_mission")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("about_us.vision_mission_description")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t("about_us.vision.title")}
                </h3>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                {t("about_us.vision.description")}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t("about_us.mission.title")}
                </h3>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                {t("about_us.mission.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("about_us.what_is_tada.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("about_us.what_is_tada.description")}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t("about_us.what_is_tada.curated_data_dashboards")}
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {t("about_us.what_is_tada.curated_data_dashboards_description")}
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t("about_us.what_is_tada.custom_data_collection_missions")}
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {t(
                  "about_us.what_is_tada.custom_data_collection_missions_description"
                )}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary to-purple-600 p-8 rounded-2xl text-white text-center">
            <Database className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h3 className="text-2xl font-bold mb-4">
              {t("about_us.what_is_tada.the_power_of_integration")}
            </h3>
            <p className="text-lg opacity-90 max-w-3xl mx-auto">
              {t("about_us.what_is_tada.the_power_of_integration_description")}
            </p>
          </div>
        </div>
      </section>

      <WhatMakesUsUnique />

      <section
        id="team"
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Photo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-4">
              <div className="aspect-square bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Team collaboration"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="aspect-[4/3] bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Office environment"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="aspect-[4/3] bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Team meeting"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="aspect-square bg-gradient-to-br from-green-400 to-green-600 rounded-2xl overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Creative workspace"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="aspect-square bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Team celebration"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="aspect-[4/3] bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Collaborative work"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="aspect-[4/3] bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Office culture"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="aspect-square bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3184394/pexels-photo-3184394.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Team bonding"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="join"
        className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-8 opacity-90" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t("about_us.why_join_tada.title")}
          </h2>
          <p className="text-xl opacity-90 max-w-4xl mx-auto mb-8 leading-relaxed">
            {t("about_us.why_join_tada.description")}
          </p>
          <p className="text-lg opacity-80 max-w-3xl mx-auto mb-10">
            {t("about_us.why_join_tada.become_part_of_the_future")}
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16   text-center">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-rational-bold mb-6">
            {t("how_work_it.contact.title")}
          </h2>

          <Button className="" asChild>
            <Link href="/schedule-a-demo">
              {" "}
              {t("how_work_it.contact.button")}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
