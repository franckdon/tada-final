import { useI18n } from "@/locales/client";
import Image from "next/image";

const LeftSection = () => {
  const t = useI18n();
  return (
    <div className="w-full md:w-1/2 p-6 md:p-12 md:px-24 flex flex-col justify-around relative overflow-hidden">
      {/* Background Image */}
      <Image
        src="/bg-login.jpg"
        alt="Background"
        fill
        className="object-cover"
        priority
        sizes="50vw"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FF5B4AB2] to-[#FF5B4AB2]/70" />

      {/* Content */}
      {/* <div className="relative z-10"> */}
      <h1 className="text-3xl z-10 md:text-5xl font-extrabold text-white leading-tight">
        {t("auth.login.title")}
      </h1>

      {/* Testimonial Card */}
      <div className="p-4 flex flex-col space-y-6  mb-4 md:p-8 bg-white/40 z-10 backdrop-blur-sm rounded-lg">
        <p className="text-white text-lg font-normal md:text-2xl">
          {t("auth.login.testimonial.quote1")}
        </p>
        <p className="text-white text-lg md:text-2xl">
          {t("auth.login.testimonial.quote2")}
        </p>
        <p className="text-white text-lg md:text-2xl">
          {t("auth.login.testimonial.quote2")}
        </p>
      </div>
      {/* </div> */}

      {/* Trusted By Section */}
      <div className="relative z-10 flex flex-col justify-center">
        <div className="flex justify-between gap-4 md:gap-8 items-center">
          <img
            src="/logos/unilever.png"
            alt="CoCa-Cola"
            width={50}
            height={50}
            className="h-6 sm:h-14 w-auto filter brightness-0 invert"
          />
          <img
            src="/logos/pepsico.png"
            alt="CoCa-Cola"
            width={50}
            height={50}
            className="h-6 sm:h-10 w-auto filter brightness-0 invert"
          />
          <img
            src="/logos/giz.png"
            alt="Unilever"
            width={120}
            height={40}
            className="h-6 sm:h-14 w-auto filter brightness-0 invert"
          />
          <img
            src="/logos/banquemondiale.png"
            alt="UNICEF"
            width={120}
            height={40}
            className="h-6 sm:h-14 w-auto filter brightness-0 invert"
          />
        </div>
        <div className="flex mt-3 justify-between gap-4 md:gap-8 items-center">
          <img
            src="/logos/unicef.png"
            alt="CoCa-Cola"
            width={50}
            height={50}
            className="h-6 sm:h-14 w-auto filter brightness-0 invert"
          />
          <img
            src="/logos/cocacola.png"
            alt="CoCa-Cola"
            width={50}
            height={50}
            className="h-6 sm:h-10 w-auto filter brightness-0 invert"
          />
          <img
            src="/logos/bcg.png"
            alt="Unilever"
            width={120}
            height={40}
            className="h-6 sm:h-10 w-auto filter brightness-0 invert"
          />
          <img
            src="/logos/mckinsey.png"
            alt="UNICEF"
            width={120}
            height={40}
            className="h-6 sm:h-14 w-auto filter brightness-0 invert"
          />
        </div>
      </div>
    </div>
  );
};

export default LeftSection;
