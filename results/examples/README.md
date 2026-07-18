# Sanitized examples

M0's redacted marker-only result is stored under `m0-npm12/`. Its five
scenario-level npm lifecycle marker counts were observed in Docker `29.6.1`, but
the overall run is Inconclusive because the required `docker cp` transfer could
not recover the running container's tmpfs output. The fixed, bounded,
hash-validated stdout bundle preserved the observations without satisfying that
transfer requirement.

This example may support only the version-specific marker baseline with that
limitation displayed. It is not capability or profile evidence. Later
presentation examples require their own review.
