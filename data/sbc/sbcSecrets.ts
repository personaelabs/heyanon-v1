export const sbcSecrets = [
  "gwh2qu",
  "lsctxp",
  "2u3p56",
  "phy4az",
  "5ig62j",
  "gu4j6z",
  "vfcyv5",
  "3oxvh6",
  "bzutgl",
  "u8bf4h",
  "sen5oz",
  "98avzs",
  "dqy2r2",
  "1td4px",
  "bo284x",
  "7k1qiq",
  "wg6nf0",
  "hobkdz",
  "q71w3l",
  "wf20ji",
  "9xkwsi",
  "bp0c34",
  "efmgdy",
  "vgag27",
  "x277fg",
  "xu3c4d",
  "kdfnj9",
  "3gz42c",
  "f9tym5",
  "16eu1s",
  "h08gra",
  "if9gm6",
  "wzvhpl",
  "zoqkgp",
  "31gjj4",
  "6i6xw3",
  "jb331a",
  "45v572",
  "laaxdk",
  "sl3x87",
  "14tcmf",
  "f6ye27",
  "0ghkvw",
  "ulbzmw",
  "m3aog4",
  "dksdsm",
  "tbdj41",
  "2bgsfl",
  "i3hs39",
  "dx9wtw",
  "bztt7u",
  "6dwqvn",
  "o208ez",
  "fj9y01",
  "pkj0zk",
  "h4aw5g",
  "x49i2n",
  "r9tkoh",
  "ymsqjm",
  "n4ud5g",
  "sazefy",
  "0e6s48",
  "pjjhjh",
  "jvw4vv",
  "kfd3sa",
  "ukdfm4",
  "xy5ep6",
  "er2u5b",
  "azf5zj",
  "2yqlcy",
  "5wqzk6",
  "md7qhj",
  "f3wgps",
  "6jgxyy",
  "gydbfc",
  "6vy6i4",
  "an1xk0",
  "qa6lip",
  "z2jodd",
  "rwaxgb",
  "162jxi",
  "3e88rv",
  "iimwlh",
  "k5thpz",
  "6dgecv",
  "8j3fyl",
  "rywdky",
  "7z9hhr",
  "gv9wb4",
  "awk4qd",
  "31j89f",
  "hxq7pi",
  "uzu4v5",
  "2e4ekh",
  "cfzfpl",
  "e2dc91",
  "ah1i7q",
  "wp8f8x",
  "1gjchr",
  "yz80vg",
  "qe1d13",
  "x6jage",
  "h4pnkg",
  "32fqpg",
  "k3srgl",
  "7s6of4",
  "c8upt7",
  "olmrxp",
  "8o8zoa",
  "vorwx5",
  "bty4o9",
  "eh69rd",
  "nd8pz2",
  "wnzb5x",
  "jzz29o",
  "9bp5yr",
  "4nj2bd",
  "bg0sjx",
  "02168q",
  "dctlk4",
  "us9exh",
  "zomtsz",
  "g1ekg5",
  "8zz19z",
  "091u3j",
  "pezoxy",
  "huypja",
  "4bwalr",
  "7n2ls9",
  "fxhvif",
  "513ddn",
  "5j3eqy",
  "it5hin",
  "y4yxo2",
  "0by2u9",
  "0h0v6q",
  "d1k41j",
  "5kcmri",
  "48rhcm",
  "h05uxt",
  "p4opcf",
  "mhqlwk",
  "sdzuaw",
  "ktzhl5",
  "i32jlb",
  "of6fbw",
  "xmvkck",
  "i0erv0",
  "0h2077",
  "hs3owj",
  "rswloq",
  "3fvfnj",
  "h5a279",
  "406jw7",
  "3c1tv6",
  "4s4hlm",
  "nryqms",
  "4eb1i5",
  "7ss0yk",
  "zs2tu7",
  "qg2d88",
  "xjlzf1",
  "l87mi6",
  "g7nllg",
  "cg52bm",
  "8api4v",
  "fka5fd",
  "8gdurv",
  "pac9nk",
  "wqscos",
  "fjnx4t",
  "rgu7nb",
  "9g6k0h",
  "ewcar2",
  "8k8oan",
  "2oxuh5",
  "6mao73",
  "l52idq",
  "h3zmgi",
  "hw4mni",
  "vl26xu",
  "kp84ce",
  "jr35a2",
  "zze5fm",
  "65ils6",
  "iskui4",
  "0kabqr",
  "8jqj59",
  "1isbe4",
  "fjpnc0",
  "yb6pt0",
  "rftuph",
  "3yzn7s",
  "o4i6en",
  "kpbim6",
  "zkrbcb",
  "hwuje0",
  "ox5rv7",
  "ctbmac",
  "7llts6",
];

function outputCSV() {
  for (const [i, secret] of sbcSecrets.entries()) {
    let label: string;
    if (i < 150) label = "Apprentice";
    else if (i < 175) label = "Wizard";
    else if (i < 190) label = "Grand wizard";
    else label = "Sorcerer";
    console.log(`https://heyanon.xyz/magic/${secret},${label}_${i}.png`);
  }
}

outputCSV();
