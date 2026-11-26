---
title: Sentinel-2
summary: Copernicus satellites image land and nearshore waters to track how Earth changes over time.
category: Earth observation
verifiedOn: "2026-11-25"
hero:
  src: /images/sentinel-feature.webp
  width: 1942
  height: 809
  label: AI-generated illustration
  attribution: Europe in Space design artwork, generated from supplied design references.
  usageTerms: The project has published no separate reuse license for this illustration.
spacecraft:
  - id: sentinel-2a
    name: Sentinel-2A
    statements:
      - text: Sentinel-2A opened the mission on 23 June 2015. Four days after launch, it imaged northwestern Italy and southern France. One of those first scenes shows the Po Valley between the Alps and the mountains near the Mediterranean coast.
        sourceIds: [esa-overview, first-image]
      - text: With Sentinel-2A flying alone, the planned revisit interval was 10 days at the equator. The mission was designed from the start for a second spacecraft to observe between those passes.
        sourceIds: [second-launch, copernicus-mission]
      - text: Sentinel-2A handed over its place in the standard two-satellite configuration to Sentinel-2C on 21 January 2025. A separate observation extension began in March 2025, adding observations alongside the main pair.
        sourceIds: [handover, copernicus-mission]
  - id: sentinel-2b
    name: Sentinel-2B
    statements:
      - text: Sentinel-2B launched on 7 March 2017 and joined Sentinel-2A. Flying half an orbit apart on the same orbital path, the two spacecraft shortened the planned revisit interval at the equator from 10 days to five.
        sourceIds: [second-launch, copernicus-mission]
      - text: Sentinel-2B carries the same type of multispectral camera as its twin. Its images span a strip 290 kilometres wide, with the finest bands sampling the ground at 10 metres. Repeated images in the same bands help users compare vegetation and land cover over time.
        sourceIds: [copernicus-mission]
      - text: Sentinel-2B stayed in the main pair when Sentinel-2C took over from Sentinel-2A. Copernicus described Sentinel-2B and Sentinel-2C as the standard configuration when the separate Sentinel-2A extension began in March 2025.
        sourceIds: [handover, copernicus-mission]
  - id: sentinel-2c
    name: Sentinel-2C
    statements:
      - text: Sentinel-2C launched on 5 September 2024 to continue the measurements Sentinel-2A had started. It carries a multispectral camera with the same 13-band design, so the mission can keep recording the same kinds of observations as spacecraft are replaced.
        sourceIds: [esa-overview, copernicus-mission]
      - text: Before taking over, Sentinel-2C operated alongside Sentinel-2A so the teams could compare and calibrate their measurements. This overlap helps keep changes in the long-running image record from being mistaken for changes on the ground.
        sourceIds: [copernicus-mission]
      - text: On 21 January 2025, Sentinel-2C took over Sentinel-2A’s observing duties in the standard two-satellite configuration. The transition kept Sentinel-2B in the pair and continued the routine observation schedule.
        sourceIds: [handover, copernicus-mission]
sources:
  - id: esa-overview
    publisher: European Space Agency
    title: Sentinel-2 mission overview
    url: https://www.esa.int/missions/about-us/directorates/earth-observation-programmes/copernicus/sentinel-2
    usageTerms:
      label: ESA terms and conditions
      url: https://www.esa.int/terms-and-conditions
  - id: copernicus-mission
    publisher: Copernicus SentiWiki
    title: Sentinel-2 mission documentation
    url: https://sentiwiki.copernicus.eu/web/s2-mission
    usageTerms:
      label: SentiWiki terms and conditions
      url: https://sentiwiki.copernicus.eu/web/terms-and-conditions
  - id: handover
    publisher: European Space Agency via Sentinel Online
    title: Timing of the Sentinel-2A to Sentinel-2C handover
    url: https://sentinels.copernicus.eu/-/precise-timing-of-transfer-of-duty-from-sentinel-2a-to-sentinel-2c-on-21-january
    publicationDate: "2025-01-17"
    effectiveDate: "2025-01-21"
    usageTerms:
      label: Sentinel Online terms and conditions
      url: https://sentinels.copernicus.eu/terms-conditions
  - id: first-image
    publisher: European Space Agency
    title: Sentinel-2A’s first image of northwest Italy and southern France
    url: https://www.esa.int/ESA_Multimedia/Images/2015/06/Northwest_Italy_and_southern_France
    effectiveDate: "2015-06-27"
  - id: second-launch
    publisher: European Space Agency
    title: Sentinel-2B launch and two-satellite coverage
    url: https://www.esa.int/Applications/Observing_the_Earth/Copernicus/Sentinel-2/Second_colour_vision_satellite_for_Copernicus_launched
    publicationDate: "2017-03-07"
---

Sentinel-2 is the Copernicus mission that takes repeated images of Earth’s land, inland waters and coastal waters. Each spacecraft measures sunlight reflected from the surface in 13 bands spanning visible and infrared light. Comparing those bands helps distinguish vegetation, water and other land cover. [Copernicus mission documentation](#source-copernicus-mission)

Repeated views let people follow plant health across a growing season and see how land cover changes over time. Those observations support work in agriculture, forestry and land management. [ESA mission overview](#source-esa-overview) · [Copernicus mission documentation](#source-copernicus-mission)

### How the images are made

Each spacecraft measures visible, near-infrared and shortwave infrared light. Four of the 13 bands sample the ground at 10 metres, six at 20 metres and three at 60 metres. The finest bands pick out features such as field boundaries, while the other bands add information that helps distinguish surface types. Each pass images a strip about 290 kilometres wide. [Copernicus mission documentation](#source-copernicus-mission)

### How often it returns

In the standard configuration, two satellites share a near-polar orbit at about 786 kilometres altitude. They cross a given area at roughly the same local solar time, which helps keep lighting comparable between images. Together they are designed to revisit a location at the equator every five days. That is an opportunity to collect an image. Clouds can still hide the surface from the optical camera. [Copernicus mission documentation](#source-copernicus-mission) · [ESA mission overview](#source-esa-overview)
