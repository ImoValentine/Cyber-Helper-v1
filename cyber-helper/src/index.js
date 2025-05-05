import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { AuthProvider } from "react-oidc-context";
import AppRouter from "./AppRouter";

const cognitoAuthConfig = {
    // This is the Cognito user pool URL from your AWS region and user pool id.
    authority: "https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_CN8VHGkFr",
    client_id: "4807b018ttoq4v6h40mhe8cn6k", // Your Cognito App Client ID.
    // Using your deployed URL as the redirect_uri:
    redirect_uri: "https://staging.dna38qewbp2fc.amplifyapp.com",
    response_type: "code",
    scope: "email openid phone",
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <AuthProvider {...cognitoAuthConfig}>
            <AppRouter />
        </AuthProvider>
    </React.StrictMode>
);
