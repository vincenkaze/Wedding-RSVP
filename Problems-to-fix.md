Found it. The Countdown section's inner .mx-auto div starts at left=0 and is 768px wide on a 1265px viewport. It should be centered (left should be ~248px). mx-auto is being ignored.

This is a Tailwind v4 issue. Let me check why.

Got it. Look at the first one:

parent: SECTION
parent_display: "flex"   ← ← ←  ← this is the bug
The Hero section is display: flex (because of flex flex-col items-center justify-center), and its .mx-auto child has margin-left: 0. mx-auto doesn't work on flex children unless the parent is justify-center. Hero is justify-center so it works. But check the next ones — parent is DIV with display: block, and mx-auto is still 0!

That's because mx-auto on a block element needs width set. The element has max-w-3xl (= 768px) but in Tailwind v4, mx-auto requires explicit width for some cases. Actually wait — the width IS 768px. So why no auto margins?

OK that hero div is in a flex flex-col items-center parent, so it's actually centered via the flex parent (not mx-auto). The width 468.7px matches the actual content. So that one's fine.

The bug is in the OTHER mx-auto divs. Let me find them:

So mx-auto IS being applied with margin-left: 0 even on a display: block parent. The width is correctly set. So margin-left: 0 means mx-auto is failing. Let me check the generated CSS to see if mx-auto is even in there.

Bingo. mx-auto is producing zero CSS rules in your output. That's why margin-left is 0 and the content leans left.

This is a real Tailwind v4 issue. Let me check what classes ARE being generated for margin:

So mx-auto IS defined: .mx-auto { margin-inline: auto; }. But it's not being applied. Let me check the actual element:

The element matches .mx-auto but margin-inline is 0px. Something is overriding it. Let me check the cascade order.

Found it. The parent is the Section component which is a <section> wrapping a <motion.div>. The motion.div is the actual child. Let me look at the parent structure:

Parent is <div style="opacity: 0;"> with no class, 1265px wide. The child is 768px with mx-auto. So mx-auto should center it... but it doesn't.

Let me check if max-w-3xl is conflicting. Or check the cascade by computing all rules applied:

Found the smoking gun. Your base.css has:

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
That universal reset is wiping out Tailwind's .mx-auto { margin-inline: auto; } because the * selector has the same specificity but comes later in the cascade (since the reset is in base.css which gets imported into main.tsx, and Tailwind utilities come via the Vite plugin after).

Actually wait — * and .mx-auto have different specificities. .mx-auto (0,1,0) > * (0,0,0). So utilities should win. Let me check the order:

tokens.css is imported first, and it has @import "tailwindcss"; at line 1. Then base.css is imported. The order in the stylesheet becomes:

Tailwind utilities (from tokens.css @import)
base.css * reset
So * { margin: 0 } from base.css comes after Tailwind's .mx-auto { margin-inline: auto }. Same specificity battle: but wait, .mx-auto (0,1,0) wins over * (0,0,0). So the utility should win regardless of order.

Let me actually check what rule order shows in the inspector:

Wait — earlier I saw .mx-auto { margin-inline: auto; } but now it returns 0. Let me search more carefully:

There it is — the rule that wins is:

*, ::after, ::before, ::backdrop, ::file-selector-button {
  box-sizing: border-box;
  margin: 0px;  ← ← ←  THIS WINS
  padding: 0px;
  border: 0px solid;
}
This is Tailwind's preflight reset. It's defined in @layer base. The order is:

Tailwind's preflight: * { margin: 0; padding: 0; ... } (from @layer base)
Your base.css: * { margin: 0; padding: 0; box-sizing: border-box; } (NOT in a layer)
Tailwind's utilities: .mx-auto { margin-inline: auto; } (in @layer utilities)
The problem: Your base.css * rule is outside any @layer, so it has higher specificity by cascade order than Tailwind's layered rules. Tailwind v4's preflight is in @layer base and your custom * reset is in the top-level cascade, so yours wins.

The fix: Move your * reset inside an @layer base so it's part of the layer system:

Now let me fix it. I'll wrap the reset in @layer base and also remove the redundant margin:0 (Tailwind preflight already does it, and the only thing your reset adds is box-sizing: border-box):

Now let me verify the fix worked:

Fixed. margin-left is now 248.5px (which is (1265 - 768) / 2). The Countdown section is now properly centered.

What was wrong
Your base.css had:

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
But this rule was outside any @layer, so it had higher cascade priority than Tailwind's .mx-auto { margin-inline: auto; } rule (which lives inside @layer utilities). The * selector beat the class because of source order, not specificity.

Tailwind v4 already resets margin: 0 and padding: 0 in its preflight (@layer base). So your reset was redundant and harmful — it was wiping out the very utilities you're trying to use.

The fix
@layer base {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
}
Keeping it inside @layer base lets Tailwind's layered utility rules (like .mx-auto) win by cascade order, which is the intent. I removed the margin: 0 and padding: 0 lines because Tailwind's preflight already does that for you.

This single fix was causing every section that uses mx-auto to lean left — Countdown, Story header, Family, Footer, etc. That's why it looked like a universal "leaning" problem.

Let me also verify the other sections are now centered:

Every .mx-auto div except index 0 is now properly centered. Index 0 is the Hero — that one is inside a flex flex-col items-center parent, so it's centered by flex, not mx-auto, which is correct.

What you need to do
I only fixed the file in the cloned copy at /home/.z/workspaces/con_KKTAdC1d0mdsXm1Z/repo-review/Wedding-RSVP/. You need to apply this same fix to your local src/styles/base.css:

- /* ── Reset ── */
- *,
- *::before,
- *::after {
-   box-sizing: border-box;
-   margin: 0;
-   padding: 0;
- }
+ @layer base {
+   *,
+   *::before,
+   *::after {
+     box-sizing: border-box;
+   }
+ }
Then commit and push. The lean will be gone.

Why this wasn't caught earlier
bun run build passed because TypeScript doesn't validate CSS cascade. ESLint didn't catch it because it's CSS layer logic, not a lint rule. The only way to find it is to inspect computed styles in a real browser — which is exactly what we just did.