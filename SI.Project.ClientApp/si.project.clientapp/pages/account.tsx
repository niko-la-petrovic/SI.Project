import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Card,
  CardActions,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";

import CreateCertForm from "../components/organisms/create-cert-form";
import { MdExpandMore } from "react-icons/md";
import UpdateUserDetailsForm from "../components/organisms/update-user-details-form";
import { useSession } from "next-auth/react";

export default function Account() {
  const { data: session, status } = useSession();

  return (
    <div className="flex flex-col gap-4 p-8">
      <h1>Account</h1>
      <Card>
        <CardContent className="grid gap-8 p-8 grid-cols-2">
          <TextField
            label="Username"
            value={session?.user?.name || ""}
            onChange={(e) => {}}
            InputProps={{
              readOnly: true,
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Email"
            value={session?.user?.email || ""}
            onChange={(e) => {}}
            InputProps={{
              readOnly: true,
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </CardContent>
      </Card>
      <div className="">
        <Accordion>
          <AccordionSummary expandIcon={<MdExpandMore />}>
            <Typography className="text-xl">Create a certificate</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className="flex flex-col gap-8">
              <div>
                Create a digital certificate (X.509) to enable encryption of
                messages and personal information.
              </div>
              <CreateCertForm />
            </div>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<MdExpandMore />}>
            <Typography className="text-xl">Personal information</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className="flex flex-col gap-4">
              <div>
                Your information is stored encrypted on the Identity Server
                using your private key.
              </div>
              <UpdateUserDetailsForm />
            </div>
          </AccordionDetails>
        </Accordion>
      </div>

      {/* TODO remove */}
      {/* <button
        onClick={() => {
          toast("Hello World", {
            type: "success",
            autoClose: false,
            closeOnClick: false,
            closeButton: false,
            draggable: false,
          });
        }}
      >
        toast
      </button> */}
    </div>
  );
}
