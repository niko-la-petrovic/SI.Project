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
        <span className="font-bold">Za studente</span>
        <div className="flex flex-col gap-y-2">
          <LinkText text="Način upotrebe" />
          <LinkText text="Dostupnost" />
          <LinkText text="Referenciranje" />
        </div>
      </div>
      <div className="flex flex-col gap-y-4">
        <span className="font-bold">Za profesore</span>
        <div className="flex flex-col gap-y-2">
          <LinkText text="Upotreba u nastavi" />
          <LinkText text="Doprinos" />
          <LinkText text="Dodavanje uzoraka" />
        </div>
      </div>
      <div className="flex flex-col gap-y-4">
        <span className="font-bold">Za investitore</span>
        <div className="flex flex-col gap-y-2">
          <LinkText text="Potencijal projekta" />
        </div>
      </div>
      <div className="flex flex-col gap-y-4">
        <span className="font-bold">Kontakt</span>
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
