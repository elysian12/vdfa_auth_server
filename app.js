const express = require("express");
require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const app = express();

app.use(express.json());

app.get("/api/v1/Authentication/GetOTP", async (req, res) => {
    const phoneNumber = req.query.phoneNumber;

    if (!phoneNumber) {
        return res.status(400).json({ msg: "Please Provide Phone Number", status: "Error", });
    }

    var res = await client.verify.v2
        .services(process.env.TWILIO_SERVICE_ID)
        .verifications.create({
            to: `+91${phoneNumber}`,
            channel: "sms",
            appHash: "+bmLh8lZj08",
        })
        .then((verification) => {
            res.status(200).json({
                msg: "OTP Sent",
                status: "Success",
                phoneNumber: verification.to,
                channel: verification.channel,

            });
        })
        .catch((err) => res.status(500).json({ msg: err, status: "Error", }));
});

app.post("/api/v1/Authentication/VerifyOTP", async (req, res) => {
    const to = req.body.phoneNumber;
    const otp = req.body.otp;

    if (!to || !otp) {
        return res.status(400).json({ msg: "Please provide phoneNumber and otp" });
    }
    await client.verify.v2
        .services(process.env.TWILIO_SERVICE_ID)
        .verificationChecks.create({ to: `+91${to}`, code: otp })
        .then((data) => {
            const status = data.status;

            if (status != "approved") {
                return res.status(403).json({ msg: "Verification Failed", status: "Error", });
            }
            const { sid } = data;
            res.status(200).json({ msg: data.status, sid, status: "Success", });
        })
        .catch((err) => res.status(500).json({ msg: err, status: "Error", }));
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Sever is listening on PORT ${PORT}`);
});
