data T = E | O T | I T

slow E        = 1
slow (O pred) = slow pred + slow pred
slow (I pred) = slow pred + slow pred

main =
  print [
    (slow (O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(E)))))))))))))))))))))))))))),
    (slow (O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(E)))))))))))))))))))))))))))),
    (slow (O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(O(E)))))))))))))))))))))))))))),
    (slow (O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(I(E)))))))))))))))))))))))))))),
    (slow (O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(O(O(E)))))))))))))))))))))))))))),
    (slow (O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(O(I(E)))))))))))))))))))))))))))),
    (slow (O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(I(O(E)))))))))))))))))))))))))))),
    (slow (O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(I(I(E))))))))))))))))))))))))))))
  ]
