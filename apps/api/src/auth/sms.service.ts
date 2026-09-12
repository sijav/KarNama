import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { z } from 'zod'
import { fail } from './errors.js'

@Injectable()
export class SmsService {
  constructor(private readonly config: ConfigService) {}

  ready() {
    if (!this.config.get<string>('KAVENEGAR_API_KEY') || !this.config.get<string>('KAVENEGAR_TEMPLATE')) fail('SMS_NOT_CONFIGURED')
  }

  async send(phone: string, code: string): Promise<void> {
    this.ready()
    const key = this.config.getOrThrow<string>('KAVENEGAR_API_KEY')
    const body = new URLSearchParams({ receptor: phone, token: code, template: this.config.getOrThrow<string>('KAVENEGAR_TEMPLATE') })
    try {
      const response = await fetch(`https://api.kavenegar.com/v1/${encodeURIComponent(key)}/verify/lookup.json`, {
        method: 'POST',
        body,
        signal: AbortSignal.timeout(15_000),
        redirect: 'error',
      })
      const result = z.object({ return: z.object({ status: z.literal(200) }) }).safeParse(await response.json())
      if (!response.ok || !result.success) fail('SMS_DELIVERY_FAILED')
    } catch {
      fail('SMS_DELIVERY_FAILED')
    }
  }
}
