import React from "react"; 
import Logo from "/src/images/church-svg.svg"
import Phone from "../components/assets/Phone";
import Mail from "../components/assets/Mail";
import LocationMarker from "../components/assets/LocationMarker";
import RiInstagramLine from "../components/assets/RiInstagramLine";
import PrimeTwitter from "../components/assets/PrimeTwitter";
import BasilTelegramOutline from "../components/assets/BasilTelegramOutline";
import MingcuteYoutubeLine from "../components/assets/MingcuteYoutubeLine";
import BgEllipse2 from "../components/assets/BgEllipse2";
import RiFacebookFill from "../components/assets/RiFacebookFill";

export default function FooterSection() {
  return (
    <footer className=''>
      <div className="px-10 mx-auto bg-black pt-10 text-white w-full">
        <div className="md:grid md:grid-cols-2 md:grid-rows-2 py-6 lg:grid-cols-4 lg:grid-rows-0 w-full -mx-4 lg:-mb-20 justify-center">
            <div className="flex flex-col gap-4">
            <div className="w-full w-1/4 px-4 mb-8 md:mb-0">
            <img
              className="h-11 w-fit text-white object-cover object-center mb-4"
              src={Logo}
              alt="Logo"
            />
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                <div>+2347088665454</div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <div>kenzi.lawson@example.com</div>
              </div>
              <div className="flex items-center gap-2">
                <LocationMarker className="h-5 w-5" />
                <div>4 Ogun River Road Isheri Magodo.</div>
              </div>
            </div>
          </div>
          <div className="w-full  md:w-3/4 lg:mx-3 px-4 mb-8 md:mb-0">
            <div className="text-xl font-semibold leading-6 mb-4">
              Service Time
            </div>
            <div className="flex flex-col gap-1">
              <div>Sunday - 7:30am</div>
              <div>Wednesday - 6:00pm</div>
              <div>{"Act13:2 - Last Saturday 4pm"}</div>
            </div>
          </div>
          <div className="w-full md:w-2/4 px-4 mb-8 md:mb-0">
            <div className="text-xl font-semibold leading-6 mb-4">
              Navigations
            </div>
            <div className="flex flex-col gap-1">
              <div>Home</div>
              <div>Give</div>
              <div>Blog</div>
              <div>Events</div>
              <div>About us</div>
              <div>Resources</div>
            </div>
          </div>
          <div className="w-full md:w-1/4 px-4 mb-8 md:mb-0">
            <div className="text-xl font-semibold leading-6 mb-4">
              Socials
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <RiInstagramLine className="lg:h-4 w-5" />
                <PrimeTwitter className="lg:h-4 w-5" />
              </div>
              <div className="flex gap-2">
                <BasilTelegramOutline className="lg:h-4 w-5" />
                <MingcuteYoutubeLine className="lg:h-4 w-5" />
              </div>
              <div className="flex items-center gap-2">
                <BgEllipse2 className="lg:h-4 w-5" />
                <RiFacebookFill className="lg:h-4 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="bg-zinc-700 text-center px-5 py-10 lg:-mt-30 text-white">Copyright © 2024 Glory Hills Community Church All Right Reserved</p>
    </footer>
  );
}
