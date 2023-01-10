import * as yup from "yup";

import { Alert, Button, TextField } from "@mui/material";
import { CertStoreActionType, CertStoreContext } from "../../store/cert-store";
import { Formik, useFormik } from "formik";
import { useContext, useEffect, useState } from "react";

import { DatePicker } from "@mui/x-date-pickers";
import { back_end } from "../../clients/is-rest-client";
import forge from "node-forge";
import { getIsRestClient } from "../../services/is-rest-client";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

const validationSchema = yup.object({
  givenName: yup.string().nullable(),
  lastName: yup.string().nullable(),
  birthDate: yup.date().nullable(),
  publicKey: yup
    .string()
    .required("Required")
    .test("is-valid-public-key", "Invalid public key", (value) => {
      if (!value) return false;
      try {
        forge.pki.publicKeyFromPem(value);
        return true;
      } catch (err) {
        return false;
      }
    }),
  privateKey: yup
    .string()
    .nullable()
    .test("is-valid-private-key", "Invalid private key", (value) => {
      if (!value) return false;
      try {
        forge.pki.privateKeyFromPem(value);
        return true;
      } catch (err) {
        return false;
      }
    }),
});

type UserDetailsFormValues = {
  givenName?: string | undefined;
  lastName?: string | undefined;
  birthDate?: Date | undefined;
  publicKey?: string | undefined;
  privateKey?: string | undefined;
};

const userDetailsFormInitialValues: UserDetailsFormValues = {};

export default function UpdateUserDetailsForm() {
  const { data: session } = useSession();
  const certStoreContext = useContext(CertStoreContext);

  const [userCreated, setUserCreated] = useState<boolean | null>(null);
  const [publicKeyUploaded, setPublicKeyUploaded] = useState<boolean | null>(
    null
  );

  const formik = useFormik({
    initialValues: userDetailsFormInitialValues,
    validationSchema,
    onSubmit: (values) => {
      const { givenName, lastName, birthDate, publicKey, privateKey } = values;
      const accessToken = session?.accessToken;
      if (!accessToken || !publicKey) return;

      const forgePubKey = forge.pki.publicKeyFromPem(publicKey);
      const encryptedGivenName = givenName
        ? forgePubKey.encrypt(givenName)
        : undefined;
      const encryptedLastName = lastName
        ? forgePubKey.encrypt(lastName)
        : undefined;
      const encryptedBirthDate = birthDate
        ? forgePubKey.encrypt(birthDate.toISOString())
        : undefined;

      const body = {
        givenName: encryptedGivenName,
        lastName: encryptedLastName,
        birthDate: encryptedBirthDate,
        publicKey,
      };

      privateKey &&
        certStoreContext.dispatch({
          type: CertStoreActionType.SET_PEM_PRIVATE_KEY,
          privateKey: privateKey,
        });

      const client = getIsRestClient(accessToken);
      if (userCreated) {
        client
          .apiUserDetailsPut(new back_end.PutUserDetailsDto(body))
          .then((res) => {
            toast.success("Updated personal information");
            publicKey &&
              certStoreContext.dispatch({
                type: CertStoreActionType.SET_PEM_PUBLIC_KEY,
                publicKey: publicKey,
              });
          })
          .catch((err) => {
            toast.error("Failed to update personal information");
          });
      } else
        client
          .apiUserDetailsPost(new back_end.PostUserDetailsDto(body))
          .then((res) => {
            setUserCreated(true);
            publicKey && setPublicKeyUploaded(true);
            publicKey &&
              certStoreContext.dispatch({
                type: CertStoreActionType.SET_PEM_PUBLIC_KEY,
                publicKey: publicKey,
              });
            toast.success("Created personal information");
          })
          .catch((err) => {
            setPublicKeyUploaded(false);
            toast.error("Failed to create personal information");
          });
    },
  });

  useEffect(() => {
    if (!session?.accessToken) return;

    const privateKey = certStoreContext.state.privateKey;
    const client = getIsRestClient(session.accessToken);
    if (userCreated === null)
      client
        .apiUserDetailsGet()
        .then((res) => {
          setUserCreated(true);
          res.publicKey && setPublicKeyUploaded(true);

          formik.setValues({
            givenName: res.givenName
              ? privateKey?.decrypt(res.givenName)
              : undefined,
            lastName: res.lastName
              ? privateKey?.decrypt(res.lastName)
              : undefined,
            birthDate: res.birthDate
              ? privateKey
                ? new Date(privateKey?.decrypt(res.birthDate))
                : undefined
              : undefined,
            publicKey: res.publicKey,
            privateKey: privateKey
              ? forge.pki.privateKeyToPem(privateKey)
              : undefined,
          });

          res.publicKey &&
            certStoreContext.dispatch({
              type: CertStoreActionType.SET_PEM_PUBLIC_KEY,
              publicKey: res.publicKey,
            });
        })
        .catch((err) => {
          console.error(err);
          setUserCreated(false);
          setPublicKeyUploaded(false);
        });
  }, [certStoreContext, formik, session?.accessToken, userCreated]);

  return (
    <div className="flex flex-col gap-y-8">
      <form onSubmit={formik.handleSubmit}>
        <div className="flex flex-col gap-y-8 w-full md:w-[600px]">
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
            InputLabelProps={{ shrink: formik.values.givenName ? true : false }}
            error={formik.touched.givenName && Boolean(formik.errors.givenName)}
            helperText={formik.touched.givenName && formik.errors.givenName}
          />
          <TextField
            name="lastName"
            label="Last Name"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            InputLabelProps={{ shrink: formik.values.lastName ? true : false }}
            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
            helperText={formik.touched.lastName && formik.errors.lastName}
          />
          <DatePicker
            label="Birth Date"
            value={formik.values.birthDate || ""}
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
              required
              className="flex-grow mr-4"
              name="publicKey"
              label="Public Key"
              value={formik.values.publicKey}
              onChange={(e) => {
                formik.setFieldTouched("publicKey", true);
                formik.handleChange(e);
              }}
              InputLabelProps={{
                shrink: formik.values.publicKey ? true : false,
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
                  accept=".pem, .crt"
                  style={{ display: "none" }}
                  type="file"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files === null || files.length === 0) return;
                    const file = files[0];

                    const reader = new FileReader();
                    reader.readAsText(file, "UTF-8");
                    reader.onload = (e) => {
                      if (e.target === null) return;
                      formik.setFieldValue("publicKey", e.target.result);
                    };
                  }}
                />
              </Button>
            </label>
            {(publicKeyUploaded === null || publicKeyUploaded === false) && (
              <span className="ml-4 text-gray-500">
                <Alert severity="warning">
                  Public key not uploaded. You cannot receive messages without
                  it.
                </Alert>
              </span>
            )}
          </div>
          {/* TODO move to account info  */}
          <div className="flex items-center justify-between">
            <TextField
              required
              className="flex-grow mr-4"
              name="privateKey"
              label="Private Key"
              value={formik.values.privateKey || ""}
              onChange={(e) => {
                formik.setFieldTouched("privateKey", true);
                formik.handleChange(e);
              }}
              InputLabelProps={{
                shrink: formik.values.privateKey ? true : false,
              }}
              error={
                formik.touched.privateKey && Boolean(formik.errors.privateKey)
              }
              helperText={formik.touched.privateKey && formik.errors.privateKey}
            />
            <label>
              <Button variant="contained" component="span">
                Upload
                <input
                  accept=".pem, .crt"
                  style={{ display: "none" }}
                  type="file"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files === null || files.length === 0) return;
                    const file = files[0];

                    const reader = new FileReader();
                    reader.readAsText(file, "UTF-8");
                    reader.onload = (e) => {
                      if (e.target === null) return;
                      formik.setFieldTouched("privateKey");
                      formik.setFieldValue("privateKey", e.target.result);
                    };
                  }}
                />
              </Button>
            </label>
            {certStoreContext.state.privateKey === null && (
              <span className="ml-4 text-gray-500">
                <Alert severity="warning">
                  Private key not uploaded. It&quot;s required for decryption.
                </Alert>
              </span>
            )}
          </div>
          <Button
            color="primary"
            variant="contained"
            type="submit"
            disabled={!formik.dirty || !formik.isValid}
          >
            Update
          </Button>
        </div>
      </form>
    </div>
  );
}
