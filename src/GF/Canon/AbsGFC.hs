module AbsGFC where

import Ident --H

-- Haskell module generated by the BNF converter, except --H

-- newtype Ident = Ident String deriving (Eq,Ord,Show) --H

data Canon =
   MGr [Ident] Ident [Module]
 | Gr [Module]
  deriving (Eq,Ord,Show)

data Module =
   Mod ModType Extend Open [Flag] [Def]
  deriving (Eq,Ord,Show)

data ModType =
   MTAbs Ident
 | MTCnc Ident Ident
 | MTRes Ident
 | MTTrans Ident Ident Ident
  deriving (Eq,Ord,Show)

data Extend =
   Ext [Ident]
 | NoExt
  deriving (Eq,Ord,Show)

data Open =
   Opens [Ident]
 | NoOpens
  deriving (Eq,Ord,Show)

data Flag =
   Flg Ident Ident
  deriving (Eq,Ord,Show)

data Def =
   AbsDCat Ident [Decl] [CIdent]
 | AbsDFun Ident Exp Exp
 | AbsDTrans Ident Exp
 | ResDPar Ident [ParDef]
 | ResDOper Ident CType Term
 | CncDCat Ident CType Term Term
 | CncDFun Ident CIdent [ArgVar] Term Term
 | AnyDInd Ident Status Ident
  deriving (Eq,Ord,Show)

data ParDef =
   ParD Ident [CType]
  deriving (Eq,Ord,Show)

data Status =
   Canon
 | NonCan
  deriving (Eq,Ord,Show)

data CIdent =
   CIQ Ident Ident
  deriving (Eq,Ord,Show)

data Exp =
   EApp Exp Exp
 | EProd Ident Exp Exp
 | EAbs Ident Exp
 | EAtom Atom
 | EData
 | EEq [Equation]
  deriving (Eq,Ord,Show)

data Sort =
   SType
  deriving (Eq,Ord,Show)

data Equation =
   Equ [APatt] Exp
  deriving (Eq,Ord,Show)

data APatt =
   APC CIdent [APatt]
 | APV Ident
 | APS String
 | API Integer
 | APW
  deriving (Eq,Ord,Show)

data Atom =
   AC CIdent
 | AD CIdent
 | AV Ident
 | AM Integer
 | AS String
 | AI Integer
 | AT Sort
  deriving (Eq,Ord,Show)

data Decl =
   Decl Ident Exp
  deriving (Eq,Ord,Show)

data CType =
   RecType [Labelling]
 | Table CType CType
 | Cn CIdent
 | TStr
 | TInts Integer
  deriving (Eq,Ord,Show)

data Labelling =
   Lbg Label CType
  deriving (Eq,Ord,Show)

data Term =
   Arg ArgVar
 | I CIdent
 | Con CIdent [Term]
 | LI Ident
 | R [Assign]
 | P Term Label
 | T CType [Case]
 | V CType [Term]
 | S Term Term
 | C Term Term
 | FV [Term]
 | EInt Integer
 | K Tokn
 | E
  deriving (Eq,Ord,Show)

data Tokn =
   KS String
 | KM String
 | KP [String] [Variant]
  deriving (Eq,Ord,Show)

data Assign =
   Ass Label Term
  deriving (Eq,Ord,Show)

data Case =
   Cas [Patt] Term
  deriving (Eq,Ord,Show)

data Variant =
   Var [String] [String]
  deriving (Eq,Ord,Show)

data Label =
   L Ident
 | LV Integer
  deriving (Eq,Ord,Show)

data ArgVar =
   A Ident Integer
 | AB Ident Integer Integer
  deriving (Eq,Ord,Show)

data Patt =
   PC CIdent [Patt]
 | PV Ident
 | PW
 | PR [PattAssign]
 | PI Integer
  deriving (Eq,Ord,Show)

data PattAssign =
   PAss Label Patt
  deriving (Eq,Ord,Show)

