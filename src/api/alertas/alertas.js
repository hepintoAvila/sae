// /api/alertas/email
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.unicesar.edu.co',
  auth: { user: 'holmespinto@unicesar.edu.co', pass: 'hepinto2018.' }
});

export default async function handler(req,res){
  const { to, tipo, prestamo } = req.body;
  const asunto = tipo==='preaviso'? 'Recordatorio: devolución en 30 min' : 'Préstamo vencido';
  const html = `
    <h3>${asunto}</h3>
    <p><b>Servicio:</b> ${prestamo.title}</p>
    <p><b>Fin:</b> ${prestamo.end}</p>
    <p>Por favor acércate a ${prestamo.dependencia_id==1?'Valledupar':'sede'}.</p>
  `;
  await transporter.sendMail({ from:'Aula <holmespinto@unicesar.edu.co>', to, subject:asunto, html });
  res.json({ok:true});
}