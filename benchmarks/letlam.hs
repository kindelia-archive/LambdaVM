{-# LANGUAGE RankNTypes #-}

data N = Z | S N

slow Z     = 1
slow (S n) =
  let k = \x -> x (slow n)
  in k (\x->x) + k (\x->x)

main :: IO ()
main = print (slow (S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(Z))))))))))))))))))))))))))))))
