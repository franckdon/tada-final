import { Button } from "@tada/ui/components/button";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="p-8 bg-white">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                Get ready for effortless consumer research
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Reach out to book a free demo or chat with our experts to get to
                know the platform and make the most out of it.
              </p>
              <Button className="text-white px-8 py-3 text-base">
                <Link
                  href="https://www.tadaiq.com/schedule-a-demo"
                  target="_blank"
                >
                  Book a free demo
                </Link>
              </Button>
            </div>
            <div className="flex justify-center">
              <Image
                src="/images/close-up-people-back-office.jpg"
                alt="Team members collage"
                width={500}
                height={350}
                className="w-full max-w-md"
              />
            </div>
          </div>
        </div>

        {/* Card 2: More powerful filtering options */}
        <div className="p-8 bg-white">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                More powerful filtering options when programming surveys
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  We updated our filters allowing for even more flexibility
                  (HAS/HAS NOT, AND/OR, up to 3 filter groups).
                </p>
                <p>Existing drafts retain old filter logic until duplicated.</p>
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                src="https://images.ctfassets.net/59y9bw5aqpl9/3yl93ygCRbbKjeK20NEr8L/0c3ede0c5d591d346c52f3f5a37ea4a3/Card__1_.jpg"
                alt="Team members collage"
                width={500}
                height={350}
                className="w-full max-w-md"
              />
            </div>
          </div>
        </div>

        <div className="p-8 bg-white">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                Get ready for effortless consumer research
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Reach out to book a free demo or chat with our experts to get to
                know the platform and make the most out of it.
              </p>
              <Button className="text-white px-8 py-3 text-base">
                <Link
                  href="https://www.tadaiq.com/schedule-a-demo"
                  target="_blank"
                >
                  Book a free demo
                </Link>
              </Button>
            </div>
            <div className="flex justify-center">
              <Image
                src="/images/local-market-scene-with-happy-traders-selling-one-using-his-phone-make-video-call.jpg"
                alt="Team members collage"
                width={500}
                height={350}
                className="w-full max-w-md"
              />
            </div>
          </div>
        </div>

        <div className="p-8 bg-white">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                Get ready for effortless consumer research
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Reach out to book a free demo or chat with our experts to get to
                know the platform and make the most out of it.
              </p>
              <Button className="text-white px-8 py-3 text-base">
                <Link
                  href="https://www.tadaiq.com/schedule-a-demo"
                  target="_blank"
                >
                  Book a free demo
                </Link>
              </Button>
            </div>
            <div className="flex justify-center">
              <Image
                src="/images/woman-checking-covid-19-mobile-application.jpg"
                alt="Team members collage"
                width={500}
                height={350}
                className="w-full max-w-md"
              />
            </div>
          </div>
        </div>

        <div className="p-8 bg-white">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                Get ready for effortless consumer research
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Reach out to book a free demo or chat with our experts to get to
                know the platform and make the most out of it.
              </p>
              <Button className="text-white px-8 py-3 text-base">
                <Link
                  href="https://www.tadaiq.com/schedule-a-demo"
                  target="_blank"
                >
                  Book a free demo
                </Link>
              </Button>
            </div>
            <div className="flex justify-center">
              <Image
                src="/images/3.jpg"
                alt="Team members collage"
                width={500}
                height={350}
                className="w-full max-w-md"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
