railway 

build log:

2026-02-08T23:13:03.669565247Z [inf]  
2026-02-08T23:13:38.619312568Z [inf]  
2026-02-08T23:13:40.991265240Z [inf]  [35m[Region: europe-west4][0m
2026-02-08T23:13:40.999005724Z [inf]  [35m==============
2026-02-08T23:13:40.999028157Z [inf]  Using Nixpacks
2026-02-08T23:13:40.999032043Z [inf]  ==============
2026-02-08T23:13:40.999036366Z [inf]  [0m
2026-02-08T23:13:40.999097022Z [inf]  context: brjv-JdyV
2026-02-08T23:13:41.066292943Z [inf]  ╔══════════════ Nixpacks v1.38.0 ═════════════╗
2026-02-08T23:13:41.066322017Z [inf]  ║ setup      │ nodejs_20                      ║
2026-02-08T23:13:41.066326232Z [inf]  ║─────────────────────────────────────────────║
2026-02-08T23:13:41.066329967Z [inf]  ║ install    │ npm install --legacy-peer-deps ║
2026-02-08T23:13:41.066335097Z [inf]  ║─────────────────────────────────────────────║
2026-02-08T23:13:41.066338512Z [inf]  ║ build      │ npm install                    ║
2026-02-08T23:13:41.066341782Z [inf]  ║─────────────────────────────────────────────║
2026-02-08T23:13:41.066345076Z [inf]  ║ start      │ npm start                      ║
2026-02-08T23:13:41.066348272Z [inf]  ╚═════════════════════════════════════════════╝
2026-02-08T23:13:41.221918836Z [inf]  [internal] load build definition from Dockerfile
2026-02-08T23:13:41.221962092Z [inf]  [internal] load build definition from Dockerfile
2026-02-08T23:13:41.221990443Z [inf]  [internal] load build definition from Dockerfile
2026-02-08T23:13:41.231896268Z [inf]  [internal] load build definition from Dockerfile
2026-02-08T23:13:41.234384867Z [inf]  [internal] load metadata for ghcr.io/railwayapp/nixpacks:ubuntu-1745885067
2026-02-08T23:13:42.103254213Z [inf]  [internal] load metadata for ghcr.io/railwayapp/nixpacks:ubuntu-1745885067
2026-02-08T23:13:42.103622709Z [inf]  [internal] load .dockerignore
2026-02-08T23:13:42.103737686Z [inf]  [internal] load .dockerignore
2026-02-08T23:13:42.103788298Z [inf]  [internal] load .dockerignore
2026-02-08T23:13:42.110136219Z [inf]  [internal] load .dockerignore
2026-02-08T23:13:42.115802735Z [inf]  [stage-0  4/10] RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d
2026-02-08T23:13:42.115846953Z [inf]  [stage-0  3/10] COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix
2026-02-08T23:13:42.115861726Z [inf]  [internal] load build context
2026-02-08T23:13:42.115871736Z [inf]  [stage-0  2/10] WORKDIR /app/
2026-02-08T23:13:42.115880293Z [inf]  [stage-0  1/10] FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
2026-02-08T23:13:42.115927299Z [inf]  [stage-0 10/10] COPY . /app
2026-02-08T23:13:42.115953647Z [inf]  [stage-0  9/10] RUN printf '\nPATH=/app/node_modules/.bin:$PATH' >> /root/.profile
2026-02-08T23:13:42.115963635Z [inf]  [stage-0  8/10] RUN --mount=type=cache,id=s/f1bd02a3-067c-431b-bf00-6d2f61b79cd9-node_modules/cache,target=/app/node_modules/.cache npm install
2026-02-08T23:13:42.115972468Z [inf]  [stage-0  7/10] COPY . /app/.
2026-02-08T23:13:42.115987435Z [inf]  [stage-0  6/10] RUN --mount=type=cache,id=s/f1bd02a3-067c-431b-bf00-6d2f61b79cd9-/root/npm,target=/root/.npm npm install --legacy-peer-deps
2026-02-08T23:13:42.115998682Z [inf]  [stage-0  5/10] COPY . /app/.
2026-02-08T23:13:42.116022853Z [inf]  [internal] load build context
2026-02-08T23:13:42.116033542Z [inf]  [stage-0  1/10] FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
2026-02-08T23:13:42.116068704Z [inf]  [internal] load build context
2026-02-08T23:13:42.123324102Z [inf]  [stage-0  1/10] FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
2026-02-08T23:13:42.123359875Z [inf]  [stage-0  1/10] FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
2026-02-08T23:13:42.124105653Z [inf]  [stage-0  1/10] FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
2026-02-08T23:13:42.124131414Z [inf]  [stage-0  1/10] FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
2026-02-08T23:13:42.139654838Z [inf]  [stage-0  1/10] FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
2026-02-08T23:13:42.140614119Z [inf]  [internal] load build context
2026-02-08T23:13:42.141700225Z [inf]  [stage-0  1/10] FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
2026-02-08T23:13:44.833762894Z [inf]  [stage-0  2/10] WORKDIR /app/
2026-02-08T23:13:44.859754793Z [inf]  [stage-0  2/10] WORKDIR /app/
2026-02-08T23:13:44.860600947Z [inf]  [stage-0  3/10] COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix
2026-02-08T23:13:44.872248233Z [inf]  [stage-0  3/10] COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix
2026-02-08T23:13:44.873499267Z [inf]  [stage-0  4/10] RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d
2026-02-08T23:13:44.985761135Z [inf]  unpacking 'https://github.com/NixOS/nixpkgs/archive/ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.tar.gz' into the Git cache...

2026-02-08T23:14:10.743761657Z [inf]  unpacking 'https://github.com/railwayapp/nix-npm-overlay/archive/main.tar.gz' into the Git cache...

2026-02-08T23:14:11.136546038Z [inf]  installing 'ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7-env'

2026-02-08T23:14:11.866367491Z [inf]  these 3 derivations will be built:
  /nix/store/1f4a312hz9m6y1ssip52drgkim8az4d6-libraries.drv
  /nix/store/79g4v87v1cgrx5vlwzcagcs6v8ps8fk2-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7-env.drv
  /nix/store/wc3m4c36g2bag9rjlq57nz3x2fvi7x1d-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7-env.drv
these 44 paths will be fetched (49.38 MiB download, 247.97 MiB unpacked):

2026-02-08T23:14:11.866381631Z [inf]    /nix/store/cf7gkacyxmm66lwl5nj6j6yykbrg4q5c-acl-2.3.2
  /nix/store/a9jgnlhkjkxav6qrc3rzg2q84pkl2wvr-attr-2.5.2
  /nix/store/5mh7kaj2fyv8mk4sfq1brwxgc02884wi-bash-5.2p37

2026-02-08T23:14:11.86638464Z [inf]    /nix/store/wf5zj2gbib3gjqllkabxaw4dh0gzcla3-builder.pl

2026-02-08T23:14:11.866413315Z [inf]    /nix/store/ivl2v8rgg7qh1jkj5pwpqycax3rc2hnl-bzip2-1.0.8
  /nix/store/mglixp03lsp0w986svwdvm7vcy17rdax-bzip2-1.0.8-bin

2026-02-08T23:14:11.866421247Z [inf]    /nix/store/4s9rah4cwaxflicsk5cndnknqlk9n4p3-coreutils-9.5
  /nix/store/00g69vw7c9lycy63h45ximy0wmzqx5y6-diffutils-3.10
  /nix/store/74h4z8k82pmp24xryflv4lxkz8jlpqqd-ed-1.20.2
  /nix/store/c4rj90r2m89rxs64hmm857mipwjhig5d-file-5.46
  /nix/store/jqrz1vq5nz4lnv9pqzydj0ir58wbjfy1-findutils-4.10.0
  /nix/store/a3c47r5z1q2c4rz0kvq8hlilkhx2s718-gawk-5.3.1

2026-02-08T23:14:11.866424862Z [inf]    /nix/store/bpq1s72cw9qb2fs8mnmlw6hn2c7iy0ss-gcc-14-20241116-lib
  /nix/store/17v0ywnr3akp85pvdi56gwl99ljv95kx-gcc-14-20241116-libgcc

2026-02-08T23:14:11.866474189Z [inf]    /nix/store/65h17wjrrlsj2rj540igylrx7fqcd6vq-glibc-2.40-36
  /nix/store/a2byxfv4lc8f2g5xfzw8cz5q8k05wi29-gmp-with-cxx-6.3.0
  /nix/store/1m67ipsk39xvhyqrxnzv2m2p48pil8kl-gnu-config-2024-01-01
  /nix/store/aap6cq56amx4mzbyxp2wpgsf1kqjcr1f-gnugrep-3.11
  /nix/store/fp6cjl1zcmm6mawsnrb5yak1wkz2ma8l-gnumake-4.4.1
  /nix/store/abm77lnrkrkb58z6xp1qwjcr1xgkcfwm-gnused-4.9
  /nix/store/9cwwj1c9csmc85l2cqzs3h9hbf1vwl6c-gnutar-1.35
  /nix/store/nvvj6sk0k6px48436drlblf4gafgbvzr-gzip-1.13
  /nix/store/wwipgdqb4p2fr46kmw9c5wlk799kbl68-icu4c-74.2
  /nix/store/m8w3mf0i4862q22bxad0wspkgdy4jnkk-icu4c-74.2-dev
  /nix/store/34z2792zyd4ayl5186vx0s98ckdaccz9-libidn2-2.3.7

2026-02-08T23:14:11.866478507Z [inf]    /nix/store/xcqcgqazykf6s7fsn08k0blnh0wisdcl-libunistring-1.3
  /nix/store/r9ac2hwnmb0nxwsrvr6gi9wsqf2whfqj-libuv-1.49.2
  /nix/store/ll14czvpxglf6nnwmmrmygplm830fvlv-libuv-1.49.2-dev
  /nix/store/6cr0spsvymmrp1hj5n0kbaxw55w1lqyp-libxcrypt-4.4.36

2026-02-08T23:14:11.866511825Z [inf]    /nix/store/j7dx1n6m5axf9r2bvly580x2ixx546wq-nodejs-20.18.1
  /nix/store/h1ydpxkw9qhjdxjpic1pdc2nirggyy6f-openssl-3.3.2
  /nix/store/lygl27c44xv73kx1spskcgvzwq7z337c-openssl-3.3.2-bin
  /nix/store/pp2zf8bdgyz60ds8vcshk2603gcjgp72-openssl-3.3.2-dev
  /nix/store/5yja5dpk2qw1v5mbfbl2d7klcdfrh90w-patch-2.7.6
  /nix/store/srfxqk119fijwnprgsqvn68ys9kiw0bn-patchelf-0.15.0
  /nix/store/3j1p598fivxs69wx3a657ysv3rw8k06l-pcre2-10.44
  /nix/store/1i003ijlh9i0mzp6alqby5hg3090pjdx-perl-5.40.0

2026-02-08T23:14:11.866514997Z [inf]    /nix/store/4ig84cyqi6qy4n0sanrbzsw1ixa497jx-stdenv-linux

2026-02-08T23:14:11.866517887Z [inf]    /nix/store/d29r1bdmlvwmj52apgcdxfl1mm9c5782-update-autotools-gnu-config-scripts-hook

2026-02-08T23:14:11.866521129Z [inf]    /nix/store/acfkqzj5qrqs88a4a6ixnybbjxja663d-xgcc-14-20241116-libgcc

2026-02-08T23:14:11.866524496Z [inf]    /nix/store/c2njy6bv84kw1i4bjf5k5gn7gz8hn57n-xz-5.6.3

2026-02-08T23:14:11.866527343Z [inf]    /nix/store/h18s640fnhhj2qdh5vivcfbxvz377srg-xz-5.6.3-bin

2026-02-08T23:14:11.866555113Z [inf]    /nix/store/cqlaa2xf6lslnizyj9xqa8j0ii1yqw0x-zlib-1.3.1
  /nix/store/1lggwqzapn5mn49l9zy4h566ysv9kzdb-zlib-1.3.1-dev

2026-02-08T23:14:11.873147253Z [inf]  copying path '/nix/store/wf5zj2gbib3gjqllkabxaw4dh0gzcla3-builder.pl' from 'https://cache.nixos.org'...

2026-02-08T23:14:11.876647533Z [inf]  copying path '/nix/store/17v0ywnr3akp85pvdi56gwl99ljv95kx-gcc-14-20241116-libgcc' from 'https://cache.nixos.org'...
copying path '/nix/store/1m67ipsk39xvhyqrxnzv2m2p48pil8kl-gnu-config-2024-01-01' from 'https://cache.nixos.org'...

2026-02-08T23:14:11.876822195Z [inf]  copying path '/nix/store/acfkqzj5qrqs88a4a6ixnybbjxja663d-xgcc-14-20241116-libgcc' from 'https://cache.nixos.org'...

2026-02-08T23:14:11.876862075Z [inf]  copying path '/nix/store/xcqcgqazykf6s7fsn08k0blnh0wisdcl-libunistring-1.3' from 'https://cache.nixos.org'...

2026-02-08T23:14:11.888204147Z [inf]  copying path '/nix/store/d29r1bdmlvwmj52apgcdxfl1mm9c5782-update-autotools-gnu-config-scripts-hook' from 'https://cache.nixos.org'...

2026-02-08T23:14:11.926459736Z [inf]  copying path '/nix/store/34z2792zyd4ayl5186vx0s98ckdaccz9-libidn2-2.3.7' from 'https://cache.nixos.org'...

2026-02-08T23:14:11.94375603Z [inf]  copying path '/nix/store/65h17wjrrlsj2rj540igylrx7fqcd6vq-glibc-2.40-36' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.500719106Z [inf]  copying path '/nix/store/a9jgnlhkjkxav6qrc3rzg2q84pkl2wvr-attr-2.5.2' from 'https://cache.nixos.org'...
copying path '/nix/store/5mh7kaj2fyv8mk4sfq1brwxgc02884wi-bash-5.2p37' from 'https://cache.nixos.org'...
copying path '/nix/store/ivl2v8rgg7qh1jkj5pwpqycax3rc2hnl-bzip2-1.0.8' from 'https://cache.nixos.org'...
copying path '/nix/store/74h4z8k82pmp24xryflv4lxkz8jlpqqd-ed-1.20.2' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.5007744Z [inf]  copying path '/nix/store/a3c47r5z1q2c4rz0kvq8hlilkhx2s718-gawk-5.3.1' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.501401295Z [inf]  copying path '/nix/store/bpq1s72cw9qb2fs8mnmlw6hn2c7iy0ss-gcc-14-20241116-lib' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.501439288Z [inf]  copying path '/nix/store/fp6cjl1zcmm6mawsnrb5yak1wkz2ma8l-gnumake-4.4.1' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.501526207Z [inf]  copying path '/nix/store/abm77lnrkrkb58z6xp1qwjcr1xgkcfwm-gnused-4.9' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.501557281Z [inf]  copying path '/nix/store/r9ac2hwnmb0nxwsrvr6gi9wsqf2whfqj-libuv-1.49.2' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.501597065Z [inf]  copying path '/nix/store/6cr0spsvymmrp1hj5n0kbaxw55w1lqyp-libxcrypt-4.4.36' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.501658996Z [inf]  copying path '/nix/store/h1ydpxkw9qhjdxjpic1pdc2nirggyy6f-openssl-3.3.2' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.501713349Z [inf]  copying path '/nix/store/3j1p598fivxs69wx3a657ysv3rw8k06l-pcre2-10.44' from 'https://cache.nixos.org'...
copying path '/nix/store/c2njy6bv84kw1i4bjf5k5gn7gz8hn57n-xz-5.6.3' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.501803071Z [inf]  copying path '/nix/store/cqlaa2xf6lslnizyj9xqa8j0ii1yqw0x-zlib-1.3.1' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.543719505Z [inf]  copying path '/nix/store/mglixp03lsp0w986svwdvm7vcy17rdax-bzip2-1.0.8-bin' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.543772403Z [inf]  copying path '/nix/store/ll14czvpxglf6nnwmmrmygplm830fvlv-libuv-1.49.2-dev' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.546538179Z [inf]  copying path '/nix/store/5yja5dpk2qw1v5mbfbl2d7klcdfrh90w-patch-2.7.6' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.546578854Z [inf]  copying path '/nix/store/cf7gkacyxmm66lwl5nj6j6yykbrg4q5c-acl-2.3.2' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.55304378Z [inf]  copying path '/nix/store/c4rj90r2m89rxs64hmm857mipwjhig5d-file-5.46' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.553053961Z [inf]  copying path '/nix/store/1lggwqzapn5mn49l9zy4h566ysv9kzdb-zlib-1.3.1-dev' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.558403272Z [inf]  copying path '/nix/store/9cwwj1c9csmc85l2cqzs3h9hbf1vwl6c-gnutar-1.35' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.56781301Z [inf]  copying path '/nix/store/h18s640fnhhj2qdh5vivcfbxvz377srg-xz-5.6.3-bin' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.581106085Z [inf]  copying path '/nix/store/nvvj6sk0k6px48436drlblf4gafgbvzr-gzip-1.13' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.584146272Z [inf]  copying path '/nix/store/aap6cq56amx4mzbyxp2wpgsf1kqjcr1f-gnugrep-3.11' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.706514441Z [inf]  copying path '/nix/store/lygl27c44xv73kx1spskcgvzwq7z337c-openssl-3.3.2-bin' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.730112606Z [inf]  copying path '/nix/store/a2byxfv4lc8f2g5xfzw8cz5q8k05wi29-gmp-with-cxx-6.3.0' from 'https://cache.nixos.org'...
copying path '/nix/store/wwipgdqb4p2fr46kmw9c5wlk799kbl68-icu4c-74.2' from 'https://cache.nixos.org'...
copying path '/nix/store/srfxqk119fijwnprgsqvn68ys9kiw0bn-patchelf-0.15.0' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.737115865Z [inf]  copying path '/nix/store/pp2zf8bdgyz60ds8vcshk2603gcjgp72-openssl-3.3.2-dev' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.758349791Z [inf]  copying path '/nix/store/4s9rah4cwaxflicsk5cndnknqlk9n4p3-coreutils-9.5' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.818436745Z [inf]  copying path '/nix/store/00g69vw7c9lycy63h45ximy0wmzqx5y6-diffutils-3.10' from 'https://cache.nixos.org'...
copying path '/nix/store/jqrz1vq5nz4lnv9pqzydj0ir58wbjfy1-findutils-4.10.0' from 'https://cache.nixos.org'...
copying path '/nix/store/1i003ijlh9i0mzp6alqby5hg3090pjdx-perl-5.40.0' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.863811026Z [inf]  copying path '/nix/store/4ig84cyqi6qy4n0sanrbzsw1ixa497jx-stdenv-linux' from 'https://cache.nixos.org'...

2026-02-08T23:14:12.882399678Z [inf]  building '/nix/store/1f4a312hz9m6y1ssip52drgkim8az4d6-libraries.drv'...

2026-02-08T23:14:12.965615543Z [inf]  building '/nix/store/79g4v87v1cgrx5vlwzcagcs6v8ps8fk2-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7-env.drv'...

2026-02-08T23:14:13.47399782Z [inf]  copying path '/nix/store/m8w3mf0i4862q22bxad0wspkgdy4jnkk-icu4c-74.2-dev' from 'https://cache.nixos.org'...

2026-02-08T23:14:13.568962862Z [inf]  copying path '/nix/store/j7dx1n6m5axf9r2bvly580x2ixx546wq-nodejs-20.18.1' from 'https://cache.nixos.org'...

2026-02-08T23:14:14.845545059Z [inf]  building '/nix/store/wc3m4c36g2bag9rjlq57nz3x2fvi7x1d-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7-env.drv'...

2026-02-08T23:14:14.906092221Z [inf]  created 5 symlinks in user environment

2026-02-08T23:14:15.035345128Z [inf]  building '/nix/store/qfgx5xnpvv40y0i733ya0hpg56cmnf8b-user-environment.drv'...

2026-02-08T23:14:15.139587354Z [inf]  removing old generations of profile /nix/var/nix/profiles/per-user/root/channels

2026-02-08T23:14:15.13967337Z [inf]  removing old generations of profile /nix/var/nix/profiles/per-user/root/profile

2026-02-08T23:14:15.13969342Z [inf]  removing profile version 1

2026-02-08T23:14:15.139786057Z [inf]  removing old generations of profile /nix/var/nix/profiles/per-user/root/channels

2026-02-08T23:14:15.139874989Z [inf]  removing old generations of profile /nix/var/nix/profiles/per-user/root/profile

2026-02-08T23:14:15.141458265Z [inf]  finding garbage collector roots...

2026-02-08T23:14:15.141512095Z [inf]  removing stale link from '/nix/var/nix/gcroots/auto/lzjbmb2ry0z7lma2fvpqprb12921pnb5' to '/nix/var/nix/profiles/per-user/root/profile-1-link'

2026-02-08T23:14:15.145229797Z [inf]  deleting garbage...

2026-02-08T23:14:15.14864006Z [inf]  deleting '/nix/store/a9qf4wwhympzs35ncp80r185j6a21w07-user-environment'

2026-02-08T23:14:15.149095747Z [inf]  deleting '/nix/store/253kwn1730vnay87xkjgxa2v97w3y079-user-environment.drv'

2026-02-08T23:14:15.162991464Z [inf]  deleting '/nix/store/hn5mrh362n52x8wwab9s1v6bgn4n5c94-env-manifest.nix'

2026-02-08T23:14:15.16345785Z [inf]  deleting '/nix/store/4ig84cyqi6qy4n0sanrbzsw1ixa497jx-stdenv-linux'

2026-02-08T23:14:15.163650977Z [inf]  deleting '/nix/store/a3c47r5z1q2c4rz0kvq8hlilkhx2s718-gawk-5.3.1'

2026-02-08T23:14:15.165068059Z [inf]  deleting '/nix/store/9fxr7753z31rn59i64dqaajgsx0ap91p-libraries'

2026-02-08T23:14:15.165187872Z [inf]  deleting '/nix/store/abm77lnrkrkb58z6xp1qwjcr1xgkcfwm-gnused-4.9'

2026-02-08T23:14:15.166835522Z [inf]  deleting '/nix/store/lwi59jcfwk2lnrakmm1y5vw85hj3n1bi-source'

2026-02-08T23:14:15.970284659Z [inf]  deleting '/nix/store/nvvj6sk0k6px48436drlblf4gafgbvzr-gzip-1.13'

2026-02-08T23:14:15.970575341Z [inf]  deleting '/nix/store/00g69vw7c9lycy63h45ximy0wmzqx5y6-diffutils-3.10'

2026-02-08T23:14:15.972272029Z [inf]  deleting '/nix/store/jqrz1vq5nz4lnv9pqzydj0ir58wbjfy1-findutils-4.10.0'

2026-02-08T23:14:15.973947648Z [inf]  deleting '/nix/store/wf5zj2gbib3gjqllkabxaw4dh0gzcla3-builder.pl'

2026-02-08T23:14:15.97481318Z [inf]  deleting '/nix/store/aap6cq56amx4mzbyxp2wpgsf1kqjcr1f-gnugrep-3.11'

2026-02-08T23:14:15.976698334Z [inf]  deleting '/nix/store/3j1p598fivxs69wx3a657ysv3rw8k06l-pcre2-10.44'

2026-02-08T23:14:15.977108683Z [inf]  deleting '/nix/store/1i003ijlh9i0mzp6alqby5hg3090pjdx-perl-5.40.0'

2026-02-08T23:14:15.99383979Z [inf]  deleting '/nix/store/d29r1bdmlvwmj52apgcdxfl1mm9c5782-update-autotools-gnu-config-scripts-hook'

2026-02-08T23:14:15.994249184Z [inf]  deleting '/nix/store/mglixp03lsp0w986svwdvm7vcy17rdax-bzip2-1.0.8-bin'

2026-02-08T23:14:15.994531808Z [inf]  deleting '/nix/store/h18s640fnhhj2qdh5vivcfbxvz377srg-xz-5.6.3-bin'

2026-02-08T23:14:15.995035151Z [inf]  deleting '/nix/store/6cr0spsvymmrp1hj5n0kbaxw55w1lqyp-libxcrypt-4.4.36'

2026-02-08T23:14:15.995330544Z [inf]  deleting '/nix/store/5yja5dpk2qw1v5mbfbl2d7klcdfrh90w-patch-2.7.6'

2026-02-08T23:14:15.995659334Z [inf]  deleting '/nix/store/9cwwj1c9csmc85l2cqzs3h9hbf1vwl6c-gnutar-1.35'

2026-02-08T23:14:15.997405492Z [inf]  deleting '/nix/store/ivl2v8rgg7qh1jkj5pwpqycax3rc2hnl-bzip2-1.0.8'

2026-02-08T23:14:15.997633652Z [inf]  deleting '/nix/store/fp6cjl1zcmm6mawsnrb5yak1wkz2ma8l-gnumake-4.4.1'

2026-02-08T23:14:15.998939431Z [inf]  deleting '/nix/store/74h4z8k82pmp24xryflv4lxkz8jlpqqd-ed-1.20.2'

2026-02-08T23:14:15.999281266Z [inf]  deleting '/nix/store/c4rj90r2m89rxs64hmm857mipwjhig5d-file-5.46'

2026-02-08T23:14:15.999584264Z [inf]  deleting '/nix/store/srfxqk119fijwnprgsqvn68ys9kiw0bn-patchelf-0.15.0'

2026-02-08T23:14:15.999948179Z [inf]  deleting '/nix/store/1m67ipsk39xvhyqrxnzv2m2p48pil8kl-gnu-config-2024-01-01'

2026-02-08T23:14:16.000159174Z [inf]  deleting '/nix/store/c2njy6bv84kw1i4bjf5k5gn7gz8hn57n-xz-5.6.3'

2026-02-08T23:14:16.00124Z [inf]  deleting '/nix/store/m84a5qpv8vgdy0mm1d81x6bajmdax5fj-source'

2026-02-08T23:14:16.001949624Z [inf]  deleting unused links...

2026-02-08T23:14:17.212439571Z [inf]  note: currently hard linking saves -1.56 MiB

2026-02-08T23:14:17.263980891Z [inf]  29 store paths deleted, 247.85 MiB freed

2026-02-08T23:14:18.107623045Z [inf]  [stage-0  4/10] RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d
2026-02-08T23:14:18.115413107Z [inf]  [stage-0  5/10] COPY . /app/.
2026-02-08T23:14:18.223042050Z [inf]  [stage-0  5/10] COPY . /app/.
2026-02-08T23:14:18.223889339Z [inf]  [stage-0  6/10] RUN --mount=type=cache,id=s/f1bd02a3-067c-431b-bf00-6d2f61b79cd9-/root/npm,target=/root/.npm npm install --legacy-peer-deps
2026-02-08T23:14:18.382306717Z [inf]  npm warn config production Use `--omit=dev` instead.

2026-02-08T23:14:18.661656267Z [inf]  npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'bson@7.2.0',
npm warn EBADENGINE   required: { node: '>=20.19.0' },
npm warn EBADENGINE   current: { node: 'v20.18.1', npm: '10.8.2' }
npm warn EBADENGINE }

2026-02-08T23:14:18.662675066Z [inf]  npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'mongodb@7.1.0',
npm warn EBADENGINE   required: { node: '>=20.19.0' },
npm warn EBADENGINE   current: { node: 'v20.18.1', npm: '10.8.2' }
npm warn EBADENGINE }

2026-02-08T23:14:18.663086874Z [inf]  npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'mongodb-connection-string-url@7.0.1',
npm warn EBADENGINE   required: { node: '>=20.19.0' },
npm warn EBADENGINE   current: { node: 'v20.18.1', npm: '10.8.2' }
npm warn EBADENGINE }

2026-02-08T23:14:19.753339821Z [inf]  npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported

2026-02-08T23:14:19.772292587Z [inf]  npm warn deprecated npmlog@5.0.1: This package is no longer supported.

2026-02-08T23:14:19.826624933Z [inf]  npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.

2026-02-08T23:14:19.972036412Z [inf]  npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me

2026-02-08T23:14:19.98787209Z [inf]  npm warn deprecated are-we-there-yet@2.0.0: This package is no longer supported.

2026-02-08T23:14:20.088518877Z [inf]  npm warn deprecated gauge@3.0.2: This package is no longer supported.

2026-02-08T23:14:20.169951072Z [inf]  npm warn deprecated tar@6.2.1: Old versions of tar are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me

2026-02-08T23:14:21.216002888Z [inf]  
added 248 packages, and audited 249 packages in 3s

2026-02-08T23:14:21.216038023Z [inf]  

2026-02-08T23:14:21.216043632Z [inf]  34 packages are looking for funding

2026-02-08T23:14:21.21604603Z [inf]    run `npm fund` for details

2026-02-08T23:14:21.219442918Z [inf]  
3 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

2026-02-08T23:14:21.280993879Z [inf]  [stage-0  6/10] RUN --mount=type=cache,id=s/f1bd02a3-067c-431b-bf00-6d2f61b79cd9-/root/npm,target=/root/.npm npm install --legacy-peer-deps
2026-02-08T23:14:21.281962212Z [inf]  [stage-0  7/10] COPY . /app/.
2026-02-08T23:14:21.336321836Z [inf]  [stage-0  7/10] COPY . /app/.
2026-02-08T23:14:21.337074345Z [inf]  [stage-0  8/10] RUN --mount=type=cache,id=s/f1bd02a3-067c-431b-bf00-6d2f61b79cd9-node_modules/cache,target=/app/node_modules/.cache npm install
2026-02-08T23:14:21.499480437Z [inf]  npm warn config production Use `--omit=dev` instead.

2026-02-08T23:14:21.758508176Z [inf]  npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'bson@7.2.0',
npm warn EBADENGINE   required: { node: '>=20.19.0' },
npm warn EBADENGINE   current: { node: 'v20.18.1', npm: '10.8.2' }
npm warn EBADENGINE }

2026-02-08T23:14:21.759512431Z [inf]  npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'mongodb@7.1.0',
npm warn EBADENGINE   required: { node: '>=20.19.0' },
npm warn EBADENGINE   current: { node: 'v20.18.1', npm: '10.8.2' }
npm warn EBADENGINE }

2026-02-08T23:14:21.759909336Z [inf]  npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'mongodb-connection-string-url@7.0.1',
npm warn EBADENGINE   required: { node: '>=20.19.0' },
npm warn EBADENGINE   current: { node: 'v20.18.1', npm: '10.8.2' }
npm warn EBADENGINE }

2026-02-08T23:14:22.665969611Z [inf]  
added 6 packages, and audited 255 packages in 1s

2026-02-08T23:14:22.666092385Z [inf]  
39 packages are looking for funding

2026-02-08T23:14:22.666114924Z [inf]    run `npm fund` for details

2026-02-08T23:14:22.669548234Z [inf]  
3 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

2026-02-08T23:14:22.724622346Z [inf]  [stage-0  8/10] RUN --mount=type=cache,id=s/f1bd02a3-067c-431b-bf00-6d2f61b79cd9-node_modules/cache,target=/app/node_modules/.cache npm install
2026-02-08T23:14:22.725139998Z [inf]  [stage-0  9/10] RUN printf '\nPATH=/app/node_modules/.bin:$PATH' >> /root/.profile
2026-02-08T23:14:22.840190205Z [inf]  [stage-0  9/10] RUN printf '\nPATH=/app/node_modules/.bin:$PATH' >> /root/.profile
2026-02-08T23:14:22.841072097Z [inf]  [stage-0 10/10] COPY . /app
2026-02-08T23:14:22.927266093Z [inf]  [stage-0 10/10] COPY . /app
2026-02-08T23:14:22.928791235Z [inf]  exporting to docker image format
2026-02-08T23:14:22.928815753Z [inf]  exporting to image
2026-02-08T23:14:33.009864786Z [inf]  importing to docker
2026-02-08T23:14:33.126735305Z [inf]  [auth] sharing credentials for production-europe-west4-drams3a.railway-registry.com
2026-02-08T23:14:33.126759045Z [inf]  [auth] sharing credentials for production-europe-west4-drams3a.railway-registry.com
2026-02-08T23:14:40.013669531Z [inf]  importing to docker
2026-02-08T23:14:48.885226245Z [inf]  === Successfully Built! ===
2026-02-08T23:14:48.885259790Z [inf]  Run:
2026-02-08T23:14:48.885264612Z [inf]  docker run -it production-europe-west4-drams3a.railway-registry.com/f1bd02a3-067c-431b-bf00-6d2f61b79cd9:4587d1ed-6c4c-4215-bd9a-b7e1c81d4d25
2026-02-08T23:14:49.291658850Z [inf]  [92mBuild time: 68.29 seconds[0m


deploy log:

2026-02-08T23:15:00.000000000Z [inf]  Starting Container
2026-02-08T23:15:01.572341193Z [err]  npm warn config production Use `--omit=dev` instead.
2026-02-08T23:15:01.572349175Z [inf]  
2026-02-08T23:15:01.572356664Z [inf]  > whatsapp-faq-bot@1.0.0 start
2026-02-08T23:15:01.572362900Z [inf]  > tsx src/bot.ts
2026-02-08T23:15:01.572371976Z [inf]  
2026-02-08T23:15:01.845299890Z [inf]  [dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  override existing env vars with { override: true }
2026-02-08T23:15:01.845309039Z [inf]  [dotenv@17.2.3] injecting env (0) from .env -- tip: 📡 add observability to secrets: https://dotenvx.com/ops
2026-02-08T23:15:01.845315277Z [inf]  🚀 Starting WhatsApp FAQ Bot...
2026-02-08T23:15:01.845322058Z [inf]  
2026-02-08T23:15:02.543706549Z [inf]  ✅ Connected to MongoDB
2026-02-08T23:15:03.127761527Z [inf]  ✅ MongoDB indexes created
2026-02-08T23:15:03.513345275Z [inf]  
2026-02-08T23:15:03.513383519Z [inf]  📊 Found 0 active workspace(s)
2026-02-08T23:15:03.513393310Z [inf]  [dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  enable debug logging with { debug: true }
2026-02-08T23:15:03.513393976Z [inf]  ✅ API Server running on port 3001
2026-02-08T23:15:03.513399824Z [inf]  🔄 Reconnecting all active workspaces...
2026-02-08T23:15:03.513407371Z [inf]  ✅ Reconnection complete. 0 workspace(s) connected.
2026-02-08T23:15:03.513408920Z [inf]     Health Check: http://localhost:3001/health
2026-02-08T23:15:03.513412069Z [inf]  
2026-02-08T23:15:03.513420043Z [inf]  🌐 Starting API Server...
2026-02-08T23:15:03.513423763Z [inf]  
2026-02-08T23:15:03.513424296Z [inf]     Client API: http://localhost:3001/api/client/*
2026-02-08T23:15:03.513432418Z [inf]  
2026-02-08T23:15:03.513439225Z [inf]     Admin API: http://localhost:3001/api/admin/*
2026-02-08T23:15:03.513439500Z [inf]  ✅ Bot is running! Waiting for messages...
2026-02-08T23:15:03.513452823Z [inf]     Press Ctrl+C to stop
2026-02-08T23:15:03.513457563Z [inf]  
2026-02-08T23:15:03.513462869Z [inf]  
2026-02-08T23:15:03.513470950Z [inf]  Press Ctrl+C to stop
2026-02-08T23:15:08.556295761Z [inf]     Hit Rate: 0%
2026-02-08T23:15:08.556304586Z [inf]     Cache Size: 0 clients
2026-02-08T23:15:08.556312073Z [inf]     Messages (30d): 0
2026-02-08T23:15:08.556312084Z [inf]  
2026-02-08T23:15:08.556315697Z [inf]  
2026-02-08T23:15:08.556321645Z [inf]  📊 Resource Metrics:
2026-02-08T23:15:08.556325373Z [inf]     Cache Size: 0 clients
2026-02-08T23:15:08.556325607Z [inf]  📊 Cache Statistics:
2026-02-08T23:15:08.556328426Z [inf]     Database Size: 200 B
2026-02-08T23:15:08.556334878Z [inf]     Hits: 0
2026-02-08T23:15:08.556336476Z [inf]     Cache Hit Rate: 0.0%
2026-02-08T23:15:08.556336595Z [inf]     Clients: 0
2026-02-08T23:15:08.556341907Z [inf]     Misses: 0
2026-02-08T23:15:08.556346220Z [inf]  
2026-02-08T23:15:08.556354092Z [inf]  
2026-02-08T23:45:08.123659085Z [inf]  
2026-02-08T23:45:08.123664415Z [inf]  📊 Resource Metrics:
2026-02-08T23:45:08.123670505Z [inf]     Database Size: 200 B
2026-02-08T23:45:08.123675884Z [inf]     Clients: 0
2026-02-08T23:45:08.123680770Z [inf]     Messages (30d): 0
2026-02-08T23:45:08.123685638Z [inf]     Cache Size: 0 clients
2026-02-08T23:45:08.123690233Z [inf]     Cache Hit Rate: 0.0%
2026-02-08T23:45:08.123695022Z [inf]  