import { AiFillLinkedin, AiFillYoutube } from "react-icons/ai";
import { BsMailbox, BsSkype, BsTwitter } from "react-icons/bs";
import { MdFacebook, MdMail, MdPhone } from "react-icons/md";

import Title from "../molecules/title";

export default function Footer() {
  return (
    <footer className="flex flex-col md:flex-row md:justify-between gap-12 p-8 bg-blue-100">
      <div className="flex flex-col gap-y-4">
        <Title />
        <hr className="border border-gray-50 border-opacity-40" />
        <div className="flex flex-wrap w-28 text-2xl gap-4 ">
          <IconButton icon={<MdFacebook />} />
          <IconButton icon={<AiFillLinkedin />} />
          <IconButton icon={<BsSkype />} />
          <IconButton icon={<BsTwitter />} />
          <IconButton icon={<AiFillYoutube />} />
        </div>
      </div>
      <div className="flex flex-col gap-y-4">
        <span className="font-bold">For users</span>
        <div className="flex flex-col gap-y-2">
          <LinkText text="Instructions" />
          <LinkText text="Availability" />
          <LinkText text="Privacy policy" />
        </div>
      </div>
      <div className="flex flex-col gap-y-4">
        <span className="font-bold">For admins</span>
        <div className="flex flex-col gap-y-2">
          <LinkText text="Rules" />
        </div>
      </div>
      <div className="flex flex-col gap-y-4">
        <span className="font-bold">For investors</span>
        <div className="flex flex-col gap-y-2">
          <LinkText text="Project Potential" />
        </div>
      </div>
      <div className="flex flex-col gap-y-4">
        <span className="font-bold">Contat</span>
        <span className="flex items-center gap-x-1">
          <MdMail className="text-xl" /> mejl@adresa.com
        </span>
        <span className="flex items-center">
          <MdPhone className="text-xl" /> +387 65 132 456
        </span>
        <div className="flex flex-col gap-y-2">
          <span className="flex items-center gap-x-1">
            <BsMailbox className="text-xl " /> Adresa 1
          </span>
          <span>Banja Luka 78000</span>
          <span>Republika Srpska</span>
          <span>Bosna i Hercegovina</span>
        </div>
      </div>
    </footer>
  );
}

function LinkText({ text }: { text: string }) {
  return (
    <a className="text-gray-500 hover:text-gray-600 transition-all duration-200">
      {text}
    </a>
  );
}

export function IconButton({ icon }: { icon: JSX.Element }) {
  return (
    <div className="text-primary-dark hover:text-primary transition-all duration-200 cursor-pointer">
      {icon}
    </div>
  );
}
