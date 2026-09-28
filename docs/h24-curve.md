# H24 curve interpolation

The private live chart uses a sequence of elapsed-time and multiplier anchors. Between adjacent anchors, it interpolates in logarithmic multiplier space, which creates an exponential segment that passes exactly through both anchors. The browser draws the confirmed path smoothly; the backend remains authoritative for the live multiplier and any action.

The public example uses invented anchors and a different scale. It does not disclose the production schedule.

## Forward function

For adjacent anchors (t0, m0) and (t1, m1), with t0 ≤ t ≤ t1, define:

~~~text
u = (t - t0) / (t1 - t0)
m(t) = m0 × exp( ln(m1 / m0) × u )
~~~

An equivalent form is:

~~~text
ln(m(t)) = ln(m0) + u × (ln(m1) - ln(m0))
~~~

The implementation clamps time to the curve domain, returns exact anchor values at segment boundaries, and caps the result at the final anchor.

## Inverse function

To find the elapsed time at which a target multiplier m is reached:

~~~text
u = ln(m / m0) / ln(m1 / m0)
t(m) = t0 + u × (t1 - t0)
~~~

This inverse is useful for placing a visual marker on the same time scale as the forward curve. Both functions use the same anchor pair, so their results are consistent up to floating-point precision.

## Why logarithmic interpolation

Linear interpolation would make equal time intervals add a constant amount to the multiplier. Logarithmic interpolation instead makes the multiplier grow by a constant ratio within each segment. This preserves the segment endpoints while yielding a smooth exponential shape.

Serve the repository root with <code>python -m http.server 8000</code> and visit <code>http://localhost:8000/examples/curve-demo.html</code> to inspect the synthetic curve. The page is a visualization only; it is not a game engine or a prediction of production behavior.
