# XD301 product-page draft

The local preview adds DJ Mixer to DS and creates /products/xd301 using the existing Product and Category content models. The homepage Explore XD301 CTA points to this route. The DJ Mixer menu link opens the filtered catalogue.

Content source: supplied XD301(BK) giftbox artwork revision16 July2026. Only readable, supported features are included. No price, battery capacity/runtime, output wattage, product dimensions or availability is asserted. The545×86×356mm value on the giftbox layout is not treated as product dimensions.

The first gallery image is the approved approximate generated visualisation. The second is the original supplied product image, unchanged. A visible caption distinguishes them.

## Sanity publication handover

No CMS data has been written or published. The current preview runs in demo/local content mode. For the existing Sanity mode, create a productCategory with name DJ Mixer, slug dj-mixer. Create a product with name XD301, slug xd301, reference that category, and transfer the summary, description, features, specifications and SEO from src/data/xd301.ts. Upload both images in their shown order, retaining their alt text. Use actual asset references, not local /media URLs in Sanity. Set isPopular/isNew only when editorially confirmed. Do not add a price or manual until supplied. The existing query and product page then render it without schema changes. Existing CMS content is not overwritten or supplemented silently.

## Hierarchical catalogue and campaign update

Category routes are /products/category/:major and /products/category/:major/:subcategory. Shared productTopics defines editorial structure; existing CMS category records determine products using exact name/slug matches. Unconfirmed names stay nonclickable. Empty branches are intentionally empty, not filled with demo concepts.

The XD301 reference-inspired page has Product image, Features, Specifications and Support anchor sections. An optional campaignImage image field was added to the product schema/type/query/loader for the new generated amber campaign. Upload that image into this field when publishing; no record or schema deployment has been performed here. Use the supplied original gallery photo to validate printed product detail; campaign artwork is illustrative and may differ in fine lettering. Prices and unverified competitor specifications are deliberately omitted.

## November 9 product layout revision
Campaign is the first visual; visible title/breadcrumb block removed (accessible h1 retained). Ordered features, supplied video, explicit 3D/360 pending section, split specifications gallery and details. Six giftbox highlights: scratch turntables, 16 LED pads, Space Control, crossfader, rechargeable power, pitch bend. No competitor specifications copied.
Product schema now supports productVideo (MP4 file), itemNumber and colour. Existing manual field renders download only when present. Local XD301 video is original supplied 1280×720 H264/AAC, 93.033333 seconds, unchanged SHA256 9ea41501806f530ffa94d053f1dedc769064c12da6d65272b100b20e1954de84.
Manual, 3D asset, reviews, FAQs and further numeric technical specs remain unavailable. Do not invent capacity, runtime, output wattage, physical dimensions or weight.
Managed browser verified 1165px desktop and 375px inner viewport (390px iframe incl scrollbar), no article horizontal overflow, mobile specs single column, desktop split. Video native controls/inline playback and playing readyState4 verified. Menu selected DS shows text XD301 and zero images, no Category to confirm. Website and Studio typecheck/build pass; existing ProductDeck lint warning unchanged.
