# Constrained M4 profile

承認済み policy は disposable environment/file target を省き、permissiveと同じdedicated scratch targetおよびsource targetをread-onlyとし、fixed loopback service を省き、Node permission model で fixed Node.js child を deny し、result channel だけを writable に保つ。

Base imageとsanitization済みkey-only environment inventoryはversion管理されたexact-input proposalへbindされ、base/staging/fixed-backend contractはindependent review済みだがproduction未採用である。Production offline-build backendのB-13〜B-15 remediationはDocker非実行のstatic/unit境界で実装済み・fresh independent re-review待ちである。Offline build後のbuilt-image digestがまだ存在しないため、version管理する`profile.json` は意図的に未作成としている。Static/unit testではsyntheticな非0 SHA-256値も使用するが、proposal inputやObserved evidenceとして扱わず、build resultではknown placeholderを拒否する。
