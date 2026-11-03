# KN-795 · The Tooltip and the Menu changed only in their text

**Why**, from the board: the owner's instruction of 2026-11-03 is that
everything matches the redesign, and copy drawn from the old copy says what the
design no longer says.

**Exit**, from the board: the plan lists every difference between 410:469 and
512:8350 in the copy EITM6CbJY33dMY8IsMFR4R and in the original; the component
and its stories then draw the original's version of every variant, each new
variant with a story of its own, in fa-IR and en-US, light and dark, with both
story-docs entries; sizes, gaps, radii and colours resolve through the tokens;
DESIGN.md's section is corrected; lint, tsc and its tests pass.

## Every difference, read 2026-11-03 with use_figma in both files

Every node, layer name and drawing is the same; two texts differ.

1. **Tooltip `410:469`**, the blocked delete's reason: «این وضعیت ۳ فرصت شغلی
   داره؛ برای حذفش اول باید فرصت‌های شغلی رو ببری یه ستون دیگه.» in the copy,
   «… رو ببرید یه ستون دیگه.» in the original, the verb now plural.
2. **Menu `512:8350`, Type=Card**, its last item: «حذف آگهی» in the copy, «حذف
   فرصت شغلی» in the original. The code has said «حذف فرصت شغلی» since KN-329,
   under the terminology rule, so the original now agrees with it.

Type=Status's «تغییر نام», «تغییر رنگ» and «حذف وضعیت», and Type=Card's
«تغییر وضعیت» and «باز کردن لینک آگهی», are the same in both.

## The approach

The reason is composed in code from three pieces, «این وضعیت», the count and
the rest, so the Persian catalog's two forms of the rest, one and many, take
«ببرید». Nothing in the components changes. DESIGN.md's menu section says the
original now labels the delete as the code does and quotes the new reason.

## How it is checked

The Tooltip's, the Menu's and the Status Menu's stories, which read the reason
from the catalog, the catalog test, lint, and a look at the blocked delete.
