export interface LegalDocumentSection {
  title: string
  paragraphs?: string[]
  bullets?: string[]
}

export const legalNoticeIntro = [
  "La société EPICAP SAS, soucieuse des droits des individus, notamment au regard des traitements automatisés, et dans une volonté de transparence avec ses clients, a mis en place une politique reprenant l'ensemble de ces traitements, des finalités poursuivies par ces derniers ainsi que des moyens d'actions à la disposition des individus afin qu'ils puissent au mieux exercer leurs droits.",
  "Pour toute information complémentaire sur la protection des données personnelles, nous vous invitons à consulter le site https://www.cnil.fr",
  "La version actuellement en ligne de ces conditions d'utilisation est la seule opposable pendant toute la durée d'utilisation du site et jusqu'à ce qu'une nouvelle version la remplace.",
]

export const legalNoticeSections: LegalDocumentSection[] = [
  {
    title: "Article 1 - Mentions légales",
    paragraphs: [
      "Sites : https://epicap.com",
      "Éditeur : EPICAP SAS dont le siège est situé Zi des Six Mariannes rue des Entrepreneurs 59124 Escaudain, représentée par Christophe GOHIER, Président, adresse mail : info at epicap point com, tél : 03 27 48 82 82, fax : 03 27 48 82 83, siret : 530 781 053 00018, naf : 4669C, TVA intracom : FR 955 307 810 53.",
      "Hébergeur : Le site est hébergé par OVH, dont le siège social est situé 2 rue Kellermann 59100 Roubaix, SAS au capital de 10 174 560 €, RCS Lille Métropole 424 761 419 00045, https://www.ovh.com",
    ],
  },
  {
    title: "Article 2 - Accès au site",
    paragraphs: [
      "L'accès au site et son utilisation sont réservés à un usage strictement personnel. Vous vous engagez à ne pas utiliser ce site et les informations ou données qui y figurent à des fins commerciales, politiques, publicitaires et pour toute forme de sollicitation commerciale et notamment l'envoi de courriers électroniques non sollicités.",
    ],
  },
  {
    title: "Article 3 - Contenu du site",
    paragraphs: [
      "Toutes les marques, photographies, textes, commentaires, illustrations, images animées ou non, séquences vidéo, sons, ainsi que toutes les applications informatiques qui pourraient être utilisées pour faire fonctionner ce site et plus généralement tous les éléments reproduits ou utilisés sur le site sont protégés par les lois en vigueur au titre de la propriété intellectuelle.",
      "Ils sont la propriété pleine et entière de l'éditeur ou de ses partenaires. Toute reproduction, représentation, utilisation ou adaptation, sous quelque forme que ce soit, de tout ou partie de ces éléments, y compris les applications informatiques, sans l'accord préalable et écrit de l'éditeur, sont strictement interdites. Le fait pour l'éditeur de ne pas engager de procédure dès la prise de connaissance de ces utilisations non autorisées ne vaut pas acceptation desdites utilisations et renonciation aux poursuites.",
    ],
  },
  {
    title: "Article 4 - Gestion du site",
    paragraphs: ["Pour la bonne gestion du site, l'éditeur pourra à tout moment :"],
    bullets: [
      "suspendre, interrompre ou limiter l'accès à tout ou partie du site, réserver l'accès au site, ou à certaines parties du site, à une catégorie déterminée d'internautes ;",
      "supprimer toute information pouvant en perturber le fonctionnement ou entrant en contravention avec les lois nationales ou internationales, ou avec les règles de la Nétiquette ;",
      "suspendre le site afin de procéder à des mises à jour.",
    ],
  },
  {
    title: "Article 5 - Responsabilités",
    paragraphs: [
      "La responsabilité de l'éditeur ne peut être engagée en cas de défaillance, panne, difficulté ou interruption de fonctionnement, empêchant l'accès au site ou à une de ses fonctionnalités.",
      "Le matériel de connexion au site que vous utilisez est sous votre entière responsabilité. Vous devez prendre toutes les mesures appropriées pour protéger votre matériel et vos propres données notamment d'attaques virales par Internet. Vous êtes par ailleurs seul responsable des sites et données que vous consultez.",
      "L'éditeur ne pourra être tenu responsable en cas de poursuites judiciaires à votre encontre :",
    ],
    bullets: [
      "du fait de l'usage du site ou de tout service accessible via Internet ;",
      "du fait du non-respect par vous des mentions légales et conditions générales.",
      "L'éditeur n'est pas responsable des dommages causés à vous-même, à des tiers et/ou à votre équipement du fait de votre connexion ou de votre utilisation du site et vous renoncez à toute action contre lui de ce fait.",
      "Si l'éditeur venait à faire l'objet d'une procédure amiable ou judiciaire à raison de votre utilisation du site, il pourra se retourner contre vous pour obtenir l'indemnisation de tous les préjudices, sommes, condamnations et frais qui pourraient découler de cette procédure.",
    ],
  },
  {
    title: "Article 6 - Liens hypertextes",
    paragraphs: [
      "Toute information accessible via un lien vers d'autres sites n'est pas publiée par l'éditeur. L'éditeur ne dispose d'aucun droit sur le contenu présent dans ledit lien.",
    ],
  },
  {
    title: "Article 7 - Collecte et protection des données",
    paragraphs: [
      "Vos données sont collectées par la société EPICAP SAS.",
      "Une donnée à caractère personnel désigne toute information concernant une personne physique identifiée ou identifiable (personne concernée) ; est réputée identifiable une personne qui peut être identifiée, directement ou indirectement, notamment par référence à un nom, un numéro d'identification ou à un ou plusieurs éléments spécifiques, propres à son identité physique, physiologique, génétique, psychique, économique, culturelle ou sociale.",
      "Les informations personnelles pouvant être recueillies sur le site sont principalement utilisées par l'éditeur pour la gestion des relations avec vous, et le cas échéant pour le traitement de vos demandes.",
      "Les données personnelles collectées sont les suivantes : civilité, nom, prénom, adresse mail, date de naissance, adresse, téléphone.",
    ],
  },
  {
    title: "Article 8 - Droit d'accès, de rectification et de déréférencement de vos données",
    paragraphs: [
      "En application de la réglementation applicable aux données à caractère personnel, les utilisateurs disposent des droits suivants :",
    ],
    bullets: [
      "le droit d'accès : ils peuvent exercer leur droit d'accès, pour connaître les données personnelles les concernant, en écrivant à l'adresse électronique suivante. Dans ce cas, avant la mise en œuvre de ce droit, la plateforme peut demander une preuve de l'identité de l'utilisateur afin d'en vérifier l'exactitude ;",
      "le droit de rectification : si les données à caractère personnel détenues par la plateforme sont inexactes, ils peuvent demander la mise à jour des informations ;",
      "le droit de suppression des données : les utilisateurs peuvent demander la suppression de leurs données à caractère personnel, conformément aux lois applicables en matière de protection des données ;",
      "le droit à la limitation du traitement : les utilisateurs peuvent demander à la plateforme de limiter le traitement des données personnelles conformément aux hypothèses prévues par le RGPD ;",
      "le droit de s'opposer au traitement des données : les utilisateurs peuvent s'opposer à ce que ses données soient traitées conformément aux hypothèses prévues par le RGPD ;",
      "le droit à la portabilité : ils peuvent réclamer que la plateforme leur remette les données personnelles qu'ils lui ont fournies pour les transmettre à une nouvelle plateforme ;",
      "Vous pouvez exercer ce droit en nous contactant à l'adresse suivante : EPICAP SAS dont le siège est situé Zi des Six Mariannes rue des Entrepreneurs 59124 Escaudain.",
      "Ou par mail à l'adresse : info at epicap point com.",
      "Toute demande doit être accompagnée de la photocopie d'un titre d'identité en cours de validité signé et faire mention de l'adresse à laquelle l'éditeur pourra contacter le demandeur. La réponse sera adressée dans le mois suivant la réception de la demande. Ce délai d'un mois peut être prolongé de deux mois si la complexité de la demande et/ou le nombre de demandes l'exigent.",
      "De plus, et depuis la loi n°2016-1321 du 7 octobre 2016, les personnes qui le souhaitent ont la possibilité d'organiser le sort de leurs données après leur décès. Pour plus d'information sur le sujet, vous pouvez consulter le site internet de la CNIL : https://www.cnil.fr",
      "Les utilisateurs peuvent aussi introduire une réclamation auprès de la CNIL sur le site de la CNIL : https://www.cnil.fr",
      "Nous vous recommandons de nous contacter dans un premier temps avant de déposer une réclamation auprès de la CNIL, car nous sommes à votre entière disposition pour régler votre problème.",
    ],
  },
  {
    title: "Article 9 - Utilisation des données",
    paragraphs: [
      "Les données personnelles collectées auprès des utilisateurs ont pour objectif la mise en relation avec l'utilisateur pour la gestion de ses demandes.",
    ],
  },
  {
    title: "Article 10 - Politique de conservation des données",
    paragraphs: [
      "L'éditeur conserve vos données pour la durée nécessaire pour vous fournir ses services.",
      "Dans la mesure raisonnablement nécessaire ou requise pour satisfaire aux obligations légales ou réglementaires, régler des litiges, empêcher des fraudes et abus ou appliquer les modalités et conditions, l'éditeur peut également conserver certaines des informations si nécessaire.",
    ],
  },
  {
    title: "Article 11 - Partage des données personnelles avec des tiers",
    paragraphs: [
      "Les données personnelles ne sont pas partagées avec des sociétés tierces, au sein de l'Union Européenne ou en dehors.",
    ],
  },
  {
    title: "Article 12 - Offres commerciales",
    paragraphs: [
      "Vous êtes susceptible de recevoir des offres commerciales de l'éditeur. Si vous ne le souhaitez pas, veuillez vous reporter à la procédure de l'article 8.",
      "Vos données sont susceptibles d'être utilisées par les partenaires de l'éditeur à des fins de prospection commerciale. Si vous ne le souhaitez pas, veuillez vous reporter à la procédure de l'article 8.",
      "Si, lors de la consultation du site, vous accédez à des données à caractère personnel, vous devez vous abstenir de toute collecte, de toute utilisation non autorisée et de tout acte pouvant constituer une atteinte à la vie privée ou à la réputation des personnes. L'éditeur décline toute responsabilité à cet égard.",
      "Les données sont conservées et utilisées pour une durée conforme à la législation en vigueur.",
    ],
  },
  {
    title: "Article 13 - Cookies",
    paragraphs: [
      "Un cookie, ou traceur, est un fichier électronique déposé sur un terminal (ordinateur, tablette, smartphone, ...) et lu par exemple lors de la consultation d'un site internet, de la lecture d'un courrier électronique, de l'installation ou de l'utilisation d'un logiciel ou d'une application mobile et ce quel que soit le type de terminal utilisé.",
      "En naviguant sur ce site, seuls les cookies nécessaires au fonctionnement du site et à l'accès à votre espace client seront créés et déposés sur votre terminal.",
      "L'utilisateur a par ailleurs la possibilité de désactiver les cookies à partir des paramètres de son navigateur.",
      "Pour plus d'informations sur l'utilisation, la gestion et la suppression des cookies, pour tout type de navigateur, nous vous invitons à consulter le site de la CNIL : https://www.cnil.fr",
    ],
  },
  {
    title: "Article 14 - Photographes et représentation des produits",
    paragraphs: [
      "Les photographies de produits, accompagnant leur description, ne sont pas contractuelles et n'engagent pas l'éditeur.",
    ],
  },
  {
    title: "Article 15 - Loi applicable",
    paragraphs: [
      "Les présentes conditions d'utilisation du site sont régies par la loi française et soumises à la compétence des tribunaux du siège social de l'éditeur, sous réserve d'une attribution de compétence spécifique découlant d'un texte de loi ou réglementaire particulier.",
    ],
  },
  {
    title: "Article 16 - Contactez-nous",
    paragraphs: [
      "Pour toute question, information sur les produits et services présentés sur le site, ou concernant le site lui-même, vous pouvez laisser un message à l'adresse suivante : info at epicap point com.",
    ],
  },
  {
    title: "Article 17 - Crédits",
    paragraphs: [
      "Ce site internet a été réalisé en utilisant la solution open-source PrestaShop™.",
    ],
  },
]

export const cgvIntro = [
  "Les présentes conditions générales de vente encadrent les commandes, les prix, la livraison, le paiement, les garanties, la réserve de propriété et les modalités de règlement des litiges applicables aux ventes réalisées par EPICAP SAS.",
]

export const cgvSections: LegalDocumentSection[] = [
  {
    title: "I - Dispositions générales",
    paragraphs: [
      "Sauf stipulation contraire spécifiée dans nos lettres, les commandes qui nous sont remises sont soumises, sans exception, aux conditions générales ci-après, qui annulent et remplacent toutes clauses imprimées ou manuscrites figurant sur toutes lettres et tous documents de nos acheteurs ou clients.",
      "Ces conditions générales s'appliquent aussi bien aux fournitures faites en notre nom et pour notre compte, qu'à celles faites par nous et pour le compte de tiers, à titre de sous-traitant ou autrement.",
      "Nous ne sommes liés par les engagements qui pourraient être pris par nos représentants, agents ou autres délégués de notre société que sous réserve de confirmation écrite et valablement signée, émanant de notre société. Aucune commande n'est donc définitive si elle n'a pas été acceptée expressément par accusé de réception numéroté et signé émanant de notre société.",
      "Les prix et renseignements portés sur nos catalogues, prospectus et tarifs n'engagent pas notre société qui se réserve le droit d'apporter toutes modifications au matériel ou marchandises figurés ou décrits sur ces notices publicitaires. Seules les offres écrites nous engagent vis-à-vis de nos clients.",
      "Nos tarifs, catalogues ou autres documents publicitaires ou promotionnels ne constituent pas une offre. Nous nous réservons le droit de retirer sans préavis un produit de nos documents tarifaires ou publicitaires ou d'en modifier les caractéristiques pour des raisons liées à l'évolution de la technique ou à la modification de nos conditions d'approvisionnement.",
    ],
  },
  {
    title: "II - Prix et délais de livraison",
    paragraphs: [
      "Nos prix sont toujours indiqués hors taxes. Ils doivent être majorés de la T.V.A. et de toutes les taxes fiscales et parafiscales en vigueur au moment de la facturation.",
      "Nos prix s'entendent départ usine, port en sus.",
      "Les délais de livraison ne sont donnés qu'à titre purement indicatif et sans engagement de notre part, même lorsqu'ils figurent sur notre confirmation de commande. En aucun cas, un retard dans les délais indiqués ne donne le droit à l'acheteur d'annuler la vente, de refuser la marchandise ou de réclamer à notre société des dommages et intérêts.",
    ],
  },
  {
    title: "III - Transport",
    paragraphs: [
      "Sauf stipulation contraire, la livraison est réputée effectuée en nos entrepôts. Nos matériels et marchandises sont vendus \"départ entrepôt\" de telle sorte que si notre société organise le transport, elle le fait pour le compte de l'acheteur qui en supportera le coût.",
      "En tout état de cause, les risques sont transférés à l'acheteur lors de la mise à disposition à l'acheteur du matériel ou des marchandises pour chargement.",
      "En outre, l'acheteur s'attachera à informer préalablement tout transporteur qu'il aura choisi, de la nature du matériel et des marchandises, de manière à ce qu'il ait connaissance des risques encourus et puisse prendre toutes précautions utiles.",
      "L'acheteur s'engage à vérifier la qualité et la quantité du matériel ou des marchandises dès réception. Toute réclamation relative à la qualité ou à la quantité de marchandises reçues devra d'une part faire l'objet de réserves lors de la réception et d'autre part être transmise à notre société par lettre recommandée avec accusé de réception dans un délai maximum de 48 heures suivant la date de déchargement.",
      "Un litige concernant le transport ne peut en aucun cas justifier un défaut ou un retard de paiement.",
    ],
  },
  {
    title: "IV - Conditions de paiement",
    paragraphs: [
      "Le paiement de nos factures s'effectue au siège de notre société, la domiciliation de toutes traites ou l'acceptation de chèques payables dans d'autres localités ne faisant pas novation à cette clause exclusive du lieu de paiement.",
      "Sauf convention contraire, le montant de nos factures est net sans escompte. Nos conditions de paiement, après acceptation du dossier, sont les suivantes : au comptant avant livraison pour la 1ère facture, et 30 jours nets (date de facture) pour les suivantes.",
      "Les paiements doivent être effectués en euro. En cas de non paiement du prix, des frais annexes ou des taxes à la date prévue, \"EPICAP\" peut suspendre, après notification écrite, les livraisons jusqu'au paiement intégral des factures exigibles.",
      "En outre, toute somme non payée à l'échéance convenue entraîne l'exigibilité immédiate de toutes les sommes dues quelles que soient les facilités de paiement préalablement accordées à la commande.",
      "Tout paiement non effectué à la date convenue porte de plein droit, à partir de cette date et sans mise en demeure préalable, un intérêt calculé mensuellement sur la base d'un taux égal à 2 fois le taux de l'intérêt légal en vigueur.",
      "Sous préjudice de la réserve du droit de propriété ci-dessous stipulée au profit de notre société, dans tous les cas où le paiement du matériel et des marchandises ne serait pas effectué dans le délai convenu, la vente sera résolue de plein droit et sans aucune formalité, du seul fait du non-paiement de la facture à l'échéance ou à l'une des échéances convenues.",
      "En cas de recours à une procédure judiciaire quelle qu'elle soit, \"EPICAP\" aura droit en outre et à titre de clause pénale à une indemnité forfaitaire égale à 10 % de la somme impayée, sans préjudice de tous autres dommages et intérêts éventuels.",
    ],
  },
  {
    title: "V - Garanties",
    paragraphs: [
      "Conformément à la loi, notre société garantit l'acheteur contre tout vice caché du matériel ou des produits vendus. Notre société s'engage à remédier à tout vice de fonctionnement provenant d'un défaut de conception ou de fabrication.",
      "La période de garantie à compter du jour de livraison est de 6 mois. Sont exclus de la garantie les vices provenant d'une mauvaise utilisation, d'un montage ou d'une installation effectuée par l'acheteur et d'une usure normale.",
      "Les travaux résultant de l'obligation de garantie sont effectués dans nos entrepôts après que le client nous ait renvoyé le matériel ou les pièces défectueuses aux fins de réparations ou de remplacement.",
      "Notre responsabilité est strictement limitée aux obligations ainsi définies et il est de convention expresse que notre société ne sera tenue à aucune indemnisation envers l'acheteur au titre de dommages immatériels, indirects ou pertes d'exploitation.",
      "Toute réclamation, qu'elle porte sur la quantité ou la qualité des marchandises livrées, doit nécessairement être formulée par lettre recommandée avec accusé de réception dans un délai de 48 heures suivant la livraison. À défaut, l'acheteur est censé avoir accepté la quantité et la qualité des marchandises livrées.",
      "En cas de vice caché, notre garantie est limitée au remplacement des produits défectueux à l'exclusion de la réparation de tout autre préjudice. Pour pouvoir bénéficier de cette garantie, l'acheteur doit aviser sans retard et par lettre recommandée avec accusé de réception notre société et doit nous permettre de procéder aux constatations nécessaires.",
      "Tous les renseignements et informations se rapportant aux produits, aux matériels livrés sont donnés à titre indicatif seulement. Les notices, plans et autres renseignements sont communiqués pour informer de la technique d'utilisation des produits, mais ne sauraient être réputés concourir à leur mise en œuvre et n'engagent pas notre responsabilité.",
      "Un litige concernant un produit donné ne peut en aucun cas justifier le défaut de paiement des produits livrés et acceptés par l'acheteur.",
    ],
  },
  {
    title: "VI - Réserve de propriété",
    paragraphs: [
      "Notre société conserve la propriété des biens vendus jusqu'au paiement effectif de l'intégralité du prix en principal et accessoires. À cet égard, ne constitue pas des paiements, au sens de la présente disposition, la remise de traites ou de tout titre créant une obligation de payer.",
      "Le paiement ne sera réputé réalisé qu'au moment de l'encaissement effectif. Le défaut de paiement de l'une quelconque des échéances peut entraîner la revendication des biens vendus.",
      "Ces dispositions ne font pas obstacle au transfert à l'acheteur, dès la livraison, des risques de perte et de détérioration des biens vendus, ainsi que des dommages qu'il pourrait occasionner.",
      "Les marchandises en possession de l'acheteur seront présumées celles encore impayées si elles sont identiques.",
    ],
  },
  {
    title: "VII - Attribution de juridiction",
    paragraphs: [
      "Les présentes conditions générales de vente sont régies par le Droit français. En cas de contestation sur leur interprétation ou leur exécution, les Tribunaux du lieu du siège social du vendeur seront seuls compétents, quels que soient le lieu de livraison, le mode de paiement accepté et même en cas d'appel en garantie ou de pluralité de défendeurs.",
    ],
  },
]
