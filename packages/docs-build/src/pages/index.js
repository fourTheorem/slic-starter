// eslint-disable-next-line no-unused-vars
import React from 'react'
import clsx from 'clsx'
// eslint-disable-next-line no-unused-vars
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
// eslint-disable-next-line no-unused-vars
import Link from '@docusaurus/Link'
import styles from './index.module.css'
// eslint-disable-next-line no-unused-vars
import HomepageFeatures from '../components/HomepageFeatures'

// eslint-disable-next-line no-unused-vars
function HomepageHeader () {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            QUICK START
          </Link>
        </div>
      </div>
    </header>
  )
}

export default function Home () {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader/>
      <main>
        <HomepageFeatures/>
      </main>
    </ Layout>
  )
}
