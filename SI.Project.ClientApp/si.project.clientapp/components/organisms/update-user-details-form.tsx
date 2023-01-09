import * as yup from "yup";

import { Alert, AlertTitle, Button, Skeleton, TextField } from "@mui/material";
import { useEffect, useState } from "react";

import { ClipLoader } from "react-spinners";
import { DatePicker } from "@mui/x-date-pickers";
import MoonLoader from "react-spinners/MoonLoader";
import PulseLoader from "react-spinners/PulseLoader";
import { back_end } from "../../clients/is-rest-client";
import { getIsRestClient } from "../../services/is-rest-client";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { useSession } from "next-auth/react";

const validationSchema = yup.object({
  givenName: yup.string().nullable(),
  lastName: yup.string().nullable(),
  birthDate: yup.date().nullable(),
  publicKey: yup.string().nullable(),
});

type UserDetailsFormValues = {
  givenName?: string | undefined;
  lastName?: string | undefined;
  birthDate?: Date | undefined;
  publicKey?: string | undefined;
  publicKeyFile?: File | null;
};

const userDetailsFormInitialValues: UserDetailsFormValues = {};

export default function UpdateUserDetailsForm() {
  const { data: session } = useSession();

  const [userCreated, setUserCreated] = useState<boolean | null>(null);
  const [publicKeyUploaded, setPublicKeyUpload] = useState<boolean | null>(
    null
  );
  const formik = useFormik({
    initialValues: userDetailsFormInitialValues,
    validationSchema,
    onSubmit: (values) => {
      const { givenName, lastName, birthDate, publicKey } = values;
      const accessToken = session?.accessToken;
      if (!accessToken) return;

      const client = getIsRestClient(accessToken);
      if (userCreated) {
        client
          .apiUserDetailsPut(
            new back_end.PutUserDetailsDto({
              givenName,
              lastName,
              birthDate: birthDate ? birthDate : undefined,
              publicKey,
            })
          )
          .then((res) => {
            toast.success("Updated personal information");
          })
          .catch((err) => {
            toast.error("Failed to update personal information");
          });
      } else
        client
          .apiUserDetailsPost(
            new back_end.PostUserDetailsDto({
              givenName,
              lastName,
              birthDate: birthDate ? birthDate : undefined,
              publicKey,
            })
          )
          .then((res) => {
            setUserCreated(true);
            publicKey && setPublicKeyUpload(true);
            toast.success("Created personal information");
          })
          .catch((err) => {
            setPublicKeyUpload(false);
            toast.error("Failed to create personal information");
          });
    },
  });

  useEffect(() => {
    if (!session?.accessToken) return;

    const client = getIsRestClient(session?.accessToken);
    if (userCreated === null)
      client
        .apiUserDetailsGet()
        .then((res) => {
          setUserCreated(true);
          res.publicKey && setPublicKeyUpload(true);

          formik.setValues({
            givenName: res.givenName,
            lastName: res.lastName,
            birthDate: res.birthDate,
            publicKey: res.publicKey,
          });
        })
        .catch((err) => {
          setUserCreated(false);
          setPublicKeyUpload(false);
        });
  }, [formik, session?.accessToken, userCreated]);

  return (
    <div className="flex flex-col gap-y-8">
      <form onSubmit={formik.handleSubmit}>
        <div className="flex flex-col gap-y-8 w-full md:w-[450px]">
          {!userCreated && (
            <Alert severity="info">
              You haven&lsquo;t entered your personal information yet
            </Alert>
          )}
          <TextField
            name="givenName"
            label="Given Name"
            value={formik.values.givenName}
            onChange={formik.handleChange}
            error={formik.touched.givenName && Boolean(formik.errors.givenName)}
            helperText={formik.touched.givenName && formik.errors.givenName}
          />
          <TextField
            name="lastName"
            label="Last Name"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
            helperText={formik.touched.lastName && formik.errors.lastName}
          />
          {/* TODO onchange not working */}
          {/* TODO use private key to encrypt */}
          <DatePicker
            label="Birth Date"
            value={formik.values.birthDate}
            onChange={(value) => {
              formik.setFieldValue(
                "birthDate",
                value instanceof Date ? value : undefined
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                name="birthDate"
                error={
                  formik.touched.birthDate && Boolean(formik.errors.birthDate)
                }
              />
            )}
          />
          <div className="flex items-center justify-between">
            <TextField
              className="flex-grow mr-4"
              name="publicKey"
              label="Public Key"
              value={formik.values.publicKey}
              InputProps={{
                readOnly: true,
              }}
              InputLabelProps={{
                shrink: true,
              }}
              error={
                formik.touched.publicKey && Boolean(formik.errors.publicKey)
              }
              helperText={formik.touched.publicKey && formik.errors.publicKey}
            />
            <label>
              <Button variant="contained" component="span">
                Upload
                <input
                  name="publicKey"
                  accept=".pem, .crt"
                  style={{ display: "none" }}
                  type="file"
                  value={undefined}
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files === null || files.length === 0) return;
                    const file = files[0];

                    formik.setFieldValue("publicKeyFile", file);

                    const reader = new FileReader();
                    reader.readAsText(file, "UTF-8");
                    reader.onload = (e) => {
                      if (e.target === null) return;
                      console.log("READ");
                      formik.setFieldValue("publicKey", e.target.result);
                    };
                  }}
                />
              </Button>
            </label>
            {publicKeyUploaded !== null && (
              <span className="text-gray-500">
                {publicKeyUploaded === false && (
                  <Alert severity="warning">
                    Public key not uploaded. You cannot receive messages without
                    it.
                  </Alert>
                )}
              </span>
            )}
          </div>
          <Button color="primary" variant="contained" type="submit">
            Update
          </Button>
        </div>
      </form>
    </div>
  );
}
