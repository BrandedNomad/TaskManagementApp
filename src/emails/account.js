const sgMail= require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name)=>{
    sgMail.send({
        to:email,
        from:'info@brandednomad.com',
        subject:'Welcome to Task Manager',
        text:`Welcome to the task-manager, ${name}. Let me now how you get along with the app`
    });
};

const sendCancelationEmail = (email, name)=>{
    sgMail.send({
        to:email,
        from:'info@brandednomad.com',
        subject:'Account Cancelation',
        text:`Sorry to see you go ${name}. We hope to see you again some time in the future`
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
};