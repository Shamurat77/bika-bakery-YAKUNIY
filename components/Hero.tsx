'use client'

import { ArrowRight, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { BlobAccent } from './BlobAccent'

export function Hero () {
  const t = useTranslations('hero')

  return (
    <section className='relative overflow-hidden'>
      <BlobAccent
        className='top-10 -left-20 w-72 h-72'
        color='#F3A9C5'
        opacity={0.25}
        variant={1}
        animate
      />
      <BlobAccent
        className='top-40 right-0 w-96 h-96'
        color='#F3A9C5'
        opacity={0.12}
        variant={2}
      />
      <BlobAccent
        className='bottom-0 left-1/3 w-64 h-64'
        color='#C89B5C'
        opacity={0.08}
        variant={3}
      />

      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28 text-center'>
        <div className='inline-flex items-center gap-2 bg-blush-100 text-rose-dark px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in'>
          <Sparkles size={16} />
          {t('badge')}
        </div>

        <h1 className='font-fraunces font-medium text-espresso text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-6 animate-fade-in'>
          {t('title')}{' '}
          <em className='text-rose font-normal'>{t('titleAccent')}</em>
        </h1>

        <p className='text-espresso/70 text-lg lg:text-xl mb-10 max-w-2xl mx-auto leading-relaxed'>
          {t('subtitle')}
        </p>

        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <a
            href='#katalog'
            className='inline-flex items-center justify-center gap-2 bg-rose text-white px-8 py-4 rounded-full font-medium hover:bg-rose-dark transition-colors'
          >
            {t('browse')} <ArrowRight size={18} />
          </a>
          <a
            href='#maxsus-tort'
            className='inline-flex items-center justify-center px-8 py-4 rounded-full font-medium border-2 border-blush-300 text-espresso hover:border-rose hover:text-rose transition-colors'
          >
            {t('custom')}
          </a>
        </div>
      </div>
    </section>
  )
}
