import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmail(to: string, token: string) {
    const resetLink: string = `${this.configService.getOrThrow('FRONT_WEB_URL')}/reset-link?token=${token}`;
    await this.mailService.sendMail({
      to,
      from: 'Auth Backend',
      subject: 'Reset Password',
      html: `
<div style="font-family: Arial, Helvetica, sans-serif; background-color:#f4f6f8; padding:40px 0;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
    
    <tr>
      <td style="background:#4f46e5; padding:20px; text-align:center;">
        <h1 style="color:#ffffff; margin:0; font-size:22px;">Reset Password</h1>
      </td>
    </tr>

    <tr>
      <td style="padding:30px;">
        <h2 style="margin-top:0; color:#333;">Solicitud de cambio de contraseña</h2>
        
        <p style="color:#555; line-height:1.6;">
          Recibimos una solicitud para restablecer tu contraseña.  
          Haz clic en el botón de abajo para crear una nueva contraseña.
        </p>

        <div style="text-align:center; margin:30px 0;">
          <a href="${resetLink}" 
             style="background:#4f46e5; color:#ffffff; padding:14px 24px; 
                    text-decoration:none; border-radius:6px; font-weight:bold;
                    display:inline-block;">
            Restablecer contraseña
          </a>
        </div>

        <p style="color:#777; font-size:14px;">
          Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
        </p>

        <p style="word-break:break-all; font-size:14px; color:#4f46e5;">
          ${resetLink}
        </p>

        <p style="color:#777; font-size:14px; margin-top:30px;">
          Si no solicitaste este cambio, puedes ignorar este correo.
        </p>
      </td>
    </tr>

    <tr>
      <td style="background:#f4f6f8; text-align:center; padding:20px; font-size:12px; color:#999;">
        © ${new Date().getFullYear()} Tu Aplicación
      </td>
    </tr>

  </table>
</div>
`,
    });
  }
}
