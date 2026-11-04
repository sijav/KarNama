# KN-790 · The add form gained a Manual Details step and was redrawn

**Why**, from the board: the owner's instruction of 2026-11-03 is that
everything matches the redesign, and the add flow is how every job opportunity
enters the product.

**Exit**, from the board: the plan lists every difference between 166:82 in the
copy EITM6CbJY33dMY8IsMFR4R and in the original; the component and its stories
then draw the original's version of every variant, each new variant with a story
of its own, in fa-IR and en-US, light and dark, with both story-docs entries;
sizes, gaps, radii and colours resolve through the tokens; DESIGN.md's section
is corrected; lint, tsc and its tests pass.

## Every difference, read 2026-11-04

Add / Edit `166:82`: the copy is 2360 wide with five steps, the original 3000
with six. The shell is the same in both, 560 wide, 24 round and 16 between its
parts, radius lg, Elevation/Modal, the 20 close and «افزودن فرصت شغلی» in
Heading/M.

| Step                         | The copy                                                                                                                                                                                                  | The original                                                                                                                                                                                                                                   |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Paste `166:62`               | 401 tall: the Input of several lines, 140, «لینک آگهی را بچسبان، یا کل متن آگهی را اینجا کپی کن», «هم لینک را می‌پذیرد، هم متن کامل آگهی را — لازم نیست چیزی را جدا کنی.», «لینک یا متن آگهی نداری؟ خودت دستی وارد کن» | 315: the Paste Field `961:101573`, 54, «لینک یا متن کامل آگهی رو اینجا بذارید», «هم لینک، هم متن کامل آگهی؛ لازم نیست چیزی رو جدا کنید.», the Manual Path Link `961:101603` «لینک یا متن آگهی ندارید؟ ورود دستی»              |
| PasteFilled `371:422`        | 401, a link                                                                                                                                                                                               | 315, a link                                                                                                                                                                                                                                    |
| Error `304:2`                | 423: «نشد آگهی را بخوانیم», three sentences of failure, «دوباره امتحان کن»                                                                                                                                 | 315: «نتونستیم آگهی رو بخونیم», «شاید آگهی حذف شده یا سایتش اجازهٔ خوندن نمی‌ده. یه بار دیگه امتحان کنید.», «تلاش دوباره»                                                                                                                    |
| Review `150:94`              | 606: the fields, the description and the posting link as Inputs, the Status Picker in the form, «ذخیره»                                                                                                   | 606: the fields with the Source Picker and its link hint and the company's network note, then the posting link and the description under its heading row, a 48 scroll fade; the footer's Status Select at the inline start, «افزودن» |
| Manual `254:2`               | 606: Review's form, empty                                                                                                                                                                                 | 288: the title and the company over «جزئیات بیشتر», then the same footer                                                                                                                                                                      |
| Manual Details `1262:97354`  | none                                                                                                                                                                                                      | 606: «جزئیات کمتر», its chevron turned, and the rest of the form, empty, with no fade                                                                                                                                                          |

The ten fields keep their order, from the inline start: the title and the
company, then employment type and location, experience and level, the posted
date and the salary, the source and the deadline; then the posting link across
the row, then «شرح شغل و مسئولیت‌ها» at 14 and SemiBold after a 16 note icon in
`text/secondary`, 8 above a field 16 and 12 in that grows from one line, its
placeholder «متن آگهی یا شرح شغل رو اینجا بذارید». The company's note,
«۳ نفر از دیجی‌کالا در شبکهٔ شما هستند», is the field's own line under it in
Body `text/brand`, said, not pressed: the handoff links the person after the
add. The toggle is the 20 chevron in `text/secondary` and Body `text/brand`, 4
apart, at the inline start.

## The approach

1. The Paste, PasteFilled and Error steps on the Paste Field and the Manual Path
   Link, with the original's copy.
2. The form: the Source Picker in the source's place, the reader's sources
   handed down, its hint while the source is the one reading found; the
   company's note from what the page counts of its network; the description
   under its heading row, the job modal's own Part and Area, moved to
   `add-job` for both; Review's fade until the form is scrolled to its end;
   Manual's title and company over the toggle, Manual Details with the rest.
3. The footer: the Status Select at the inline start on the stages and the
   outcomes, Cancel and «افزودن» at the inline end; the status leaves the form.
4. The job modal's Info tab draws the same fields, so it takes the sources too.
5. The dates stay the fields they are: the calendar that opens from them, and
   the reader's own date written in them, are KN-818's and KN-813's.
6. Stories for every step, measured to the frames, in both languages and both
   schemes; the catalog, both docs, DESIGN.md.

## How it is checked

The stories with planted wrong values failing them, the screens' and the job
modal's stories, lint, tsc, a look against the frames, and the published check.
