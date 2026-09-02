---
title: "How We Cut Our Monorepo CI Pipeline from 12 Minutes to 2 Minutes"
date: 2026-09-01
tags: ["CI", "Turborepo", "Monorepo"]
description: "How affected-aware CI validation — running only what a change could actually affect — cut a Turborepo monorepo's pipeline from 12 minutes to 2 minutes."
---

Our frontend lives in a monorepo built with pnpm workspaces and Turborepo, with multiple applications and a growing number of shared packages.

For a while, our CI setup kept up fine. Then it did not.

The problem was not that our validation steps were particularly slow. The problem was that CI did not really understand the scope of a change.

A one-line fix in a single application could still trigger validation across a large part of the repository. Whether you changed one file or refactored a shared package, the pipeline could end up doing almost the same amount of work.

Our typical pipeline had reached around 12 minutes.

For a large change, that is not necessarily a problem. For a one-line fix, it felt unnecessary.

## The first approach was the obvious one

We initially looked at making the existing pipeline faster: better caching, faster installs, optimising some of the validation steps.

Those changes helped, but only to a point.

Eventually, we realised we were asking the wrong question.

<span class="prose-dim">Instead of:</span>

> How can we make the pipeline faster?

<span class="prose-dim">we started asking:</span>

> Why are we running all of this in the first place?

That changed the direction of the work.

## Making validation affected-aware

Turborepo already knows how the projects in our workspace depend on each other. We wanted to use that information to determine which projects could actually be affected by a change.

<span class="prose-dim">The flow was roughly:</span>

```
Git diff
   ↓
Changed files
   ↓
Owning projects
   ↓
Dependency graph
   ↓
Affected projects
   ↓
Run validation
```

<span class="prose-note">The important distinction here is changed vs. affected.</span>

If we change something inside menu, we do not necessarily need to validate unrelated applications.

But if menu depends on a shared package and that package changes, menu becomes affected even though none of its own files changed.

That distinction is what allowed us to stop treating every PR as a repository-wide validation job.

## The hard part was not finding affected projects

The graph itself was not the difficult part.

The difficult part was trusting the result enough to actually skip validation.

Skipping validation is a bet. If the affected calculation is wrong, we might miss a regression instead of simply running an unnecessary job.

So we had to be conservative.

Changes to things like shared configuration, lockfiles, build configuration, or CI workflows can have a much wider impact than a change isolated to one application. For these cases, we deliberately fall back to a broader validation scope.

The goal was not to minimise the number of things we run. It was to:

> Run the smallest set of validation we can defend.

That became an important principle for the implementation.

## The result

<span class="prose-note">After introducing affected-aware validation, our typical pipeline went from around 12 minutes to 2 minutes — roughly an 83% reduction in pipeline time.</span>

And we did not achieve that by making individual tests or builds dramatically faster. We simply stopped running work that was not necessary for most changes.

For a small change, the pipeline now works with a much smaller part of the dependency graph instead of treating the entire repository as the unit of validation.

## What I took away

The biggest lesson for me was not really about Turborepo or graph traversal.

It is that we spent a while trying to make unnecessary work faster before asking whether we needed to do that work at all. Those are two very different questions.

A monorepo does not have to mean a monolithic CI pipeline. Once you have a dependency graph, you can use it to make the feedback loop proportional to the scope of the change.

It also opened the door to applying the same idea beyond validation — selective builds, targeted tests, and eventually even deployment decisions.

<span class="prose-dim">But that is a problem for another day.</span>
